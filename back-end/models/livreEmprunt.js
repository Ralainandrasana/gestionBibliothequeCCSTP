const db = require('../config/db');
const { runPaginatedQuery } = require('../utils/pagination');
const { recordSqlQuery, recordQueryResult, bindAuditCallback } = require('../utils/auditContext');

function getConnection() {
    return new Promise((resolve, reject) => {
        db.getConnection((error, connection) => error ? reject(error) : resolve(connection));
    });
}

function runConnectionQuery(connection, sql, values = []) {
    recordSqlQuery(sql);
    return new Promise((resolve, reject) => {
        connection.query(sql, values, bindAuditCallback((error, result) => {
            if (error) return reject(error);
            recordQueryResult(result);
            resolve(result);
        }));
    });
}

function beginTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.beginTransaction(error => error ? reject(error) : resolve());
    });
}

function commitTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.commit(error => error ? reject(error) : resolve());
    });
}

function rollbackTransaction(connection) {
    return new Promise(resolve => connection.rollback(resolve));
}

class LivreEmpruntModel {
    // READ
    static async getLivreEmpruntsRecent(pagination = null) {
        const baseSql = `SELECT id, date_emprunt, date_retour, trix, livrcode
                         FROM emp_recent`;
        if (pagination) {
            return runPaginatedQuery({
                baseSql,
                searchColumns: ['id', 'trix', 'livrcode', 'date_emprunt', 'date_retour'],
                orderBy: 'source.id DESC',
                pagination
            });
        }
        return new Promise((resolve, reject) => {
            db.query(`${baseSql} order by id desc`, [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async getLivreEmpruntsNonRendu(pagination = null) {
        const baseSql = "SELECT at.id_adh, le.id_livre, le.renouvelable, le.id, at.trix, ln.livrcode, le.date_emprunt_initiale, le.date_emprunt, le.date_retour FROM (livre_emprunt le left outer join adherent_tri at on le.code_pers = at.id_adh) left outer join livrenum ln on le.id_livre = ln.id_livre where status = 0 and (at.trix is not null and ln.livrcode is not null)";
        if (pagination) {
            return runPaginatedQuery({
                baseSql,
                searchColumns: ['id', 'id_adh', 'id_livre', 'trix', 'livrcode', 'date_emprunt', 'date_retour'],
                orderBy: 'source.id DESC',
                pagination
            });
        }
        return new Promise((resolve, reject) => {
            db.query(`${baseSql} order by le.id desc`
            , [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async getLivreEmpruntNonRenduById(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT at.id_adh, le.id_livre, le.renouvelable, le.id,
                        at.trix, ln.livrcode, le.date_emprunt_initiale,
                        le.date_emprunt, le.date_retour, le.status, le.dateReelRetour
                 FROM (livre_emprunt le
                 LEFT OUTER JOIN adherent_tri at ON le.code_pers = at.id_adh)
                 LEFT OUTER JOIN livrenum ln ON le.id_livre = ln.id_livre
                 WHERE le.id = ? AND le.status = 0
                   AND at.trix IS NOT NULL AND ln.livrcode IS NOT NULL
                 LIMIT 1`,
                [id],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result[0] || null);
                }
            );
        });
    }

    // CREATE
    static async addLivreEmprunt(data) {
        const connection = await getConnection();
        const { code_pers, id_livre, date_emprunt, date_retour } = data;

        try {
            await beginTransaction(connection);

            // Conserver le même ordre de verrouillage que le rendu : livre,
            // puis adhérent. Cela limite aussi les risques d'interblocage.
            const livres = await runConnectionQuery(
                connection,
                'SELECT id_livre, disponible FROM livre WHERE id_livre = ? FOR UPDATE',
                [id_livre]
            );
            if (livres.length === 0) {
                await rollbackTransaction(connection);
                return { added: false, reason: 'LIVRE_INTROUVABLE' };
            }
            if (Number(livres[0].disponible) !== 1) {
                await rollbackTransaction(connection);
                return { added: false, reason: 'LIVRE_INDISPONIBLE' };
            }

            const adherents = await runConnectionQuery(
                connection,
                `SELECT id_adh, sanctionner, date_fin, nbrLivreEmp,
                        (CURRENT_DATE >= date_fin) AS adhesion_expiree
                 FROM adherent
                 WHERE id_adh = ?
                 FOR UPDATE`,
                [code_pers]
            );
            if (adherents.length === 0) {
                await rollbackTransaction(connection);
                return { added: false, reason: 'ADHERENT_INTROUVABLE' };
            }

            const adherent = adherents[0];
            if (Number(adherent.sanctionner) === 1) {
                await rollbackTransaction(connection);
                return { added: false, reason: 'ADHERENT_SANCTIONNE' };
            }
            if (Number(adherent.adhesion_expiree) === 1) {
                await rollbackTransaction(connection);
                return {
                    added: false,
                    reason: 'ADHESION_EXPIREE',
                    date_fin: adherent.date_fin
                };
            }
            if (Number(adherent.nbrLivreEmp) >= 2) {
                await rollbackTransaction(connection);
                return {
                    added: false,
                    reason: 'LIMITE_LIVRES_ATTEINTE',
                    nbrLivreEmp: Number(adherent.nbrLivreEmp) || 0
                };
            }

            const insertResult = await runConnectionQuery(
                connection,
                `INSERT INTO livre_emprunt
                    (code_pers, id_livre, date_emprunt, date_retour, status, dateReelRetour, renouvelable)
                 VALUES (?, ?, ?, ?, 0, NULL, TRUE)`,
                [code_pers, id_livre, date_emprunt, date_retour]
            );
            await runConnectionQuery(
                connection,
                'UPDATE livre SET disponible = FALSE WHERE id_livre = ?',
                [id_livre]
            );
            await runConnectionQuery(
                connection,
                'UPDATE adherent SET nbrLivreEmp = COALESCE(nbrLivreEmp, 0) + 1 WHERE id_adh = ?',
                [code_pers]
            );

            await commitTransaction(connection);
            return { added: true, insertId: insertResult.insertId };
        } catch (error) {
            await rollbackTransaction(connection);
            throw error;
        } finally {
            connection.release();
        }
    }

    // UPDATE
    static async updateLivreEmprunt(id, data) {
        return new Promise((resolve, reject) => {
            const { code_pers, id_livre, date_emprunt, date_retour, status, dateReelRetour, renouvelable } = data;
            db.query('UPDATE livre_emprunt SET code_pers = ?, id_livre = ?, date_emprunt = ?, date_retour = ?, status = ?, dateReelRetour = ?, renouvelable = ? WHERE id = ?', 
                     [code_pers, id_livre, date_emprunt, date_retour, status, dateReelRetour, renouvelable, id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // UPDATE
    static async renouvelerLivreEmprunt(id) {
        const connection = await getConnection();

        try {
            await beginTransaction(connection);

            const emprunts = await runConnectionQuery(
                connection,
                `SELECT
                    le.id,
                    le.status,
                    le.renouvelable,
                    le.code_pers,
                    a.id_adh,
                    a.sanctionner,
                    a.date_fin,
                    a.nbrLivreEmp,
                    (CURRENT_DATE > le.date_retour) AS retour_en_retard,
                    (CURRENT_DATE >= a.date_fin) AS adhesion_expiree
                 FROM livre_emprunt le
                 LEFT JOIN adherent a ON a.id_adh = le.code_pers
                 WHERE le.id = ?
                 FOR UPDATE`,
                [id]
            );

            if (emprunts.length === 0) {
                await rollbackTransaction(connection);
                return { found: false };
            }

            const emprunt = emprunts[0];
            const reasons = [];

            if (Number(emprunt.status) !== 0) reasons.push('DEJA_RENDU');
            if (Number(emprunt.renouvelable) !== 1) reasons.push('DEJA_RENOUVELE');
            if (!emprunt.id_adh) reasons.push('ADHERENT_INTROUVABLE');
            if (Number(emprunt.sanctionner) === 1) reasons.push('ADHERENT_SANCTIONNE');
            if (Number(emprunt.adhesion_expiree) === 1) reasons.push('ADHESION_EXPIREE');
            // Un renouvellement équivaut à rendre puis réemprunter le même
            // livre : 2 emprunts sont donc acceptés, mais pas davantage.
            if (Number(emprunt.nbrLivreEmp) > 2) reasons.push('LIMITE_LIVRES_DEPASSEE');

            if (reasons.length > 0) {
                await rollbackTransaction(connection);
                return { found: true, renewed: false, reasons, emprunt };
            }

            await runConnectionQuery(
                connection,
                `UPDATE livre_emprunt
                 SET date_emprunt_initiale = COALESCE(date_emprunt_initiale, date_emprunt),
                     renouvelable = FALSE,
                     date_emprunt = CURRENT_DATE,
                     date_retour = DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY)
                 WHERE id = ?`,
                [id]
            );

            if (Number(emprunt.retour_en_retard) === 1) {
                await runConnectionQuery(
                    connection,
                    `UPDATE adherent
                     SET sanctionner = CASE
                             WHEN COALESCE(penaliser, 0) + 1 >= 3 THEN TRUE
                             ELSE sanctionner
                         END,
                         penaliser = COALESCE(penaliser, 0) + 1
                     WHERE id_adh = ?`,
                    [emprunt.code_pers]
                );
            }

            const [empruntRenouvele] = await runConnectionQuery(
                connection,
                'SELECT date_emprunt_initiale, date_emprunt, date_retour, renouvelable FROM livre_emprunt WHERE id = ?',
                [id]
            );

            await commitTransaction(connection);
            return {
                found: true,
                renewed: true,
                emprunt: empruntRenouvele,
                retourEnRetard: Number(emprunt.retour_en_retard) === 1
            };
        } catch (error) {
            await rollbackTransaction(connection);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async rendreLivreEmprunt(id) {
        const connection = await getConnection();

        try {
            await beginTransaction(connection);

            const emprunts = await runConnectionQuery(
                connection,
                `SELECT id, code_pers, id_livre, status,
                        (CURRENT_DATE > date_retour) AS retour_en_retard
                 FROM livre_emprunt
                 WHERE id = ?
                 FOR UPDATE`,
                [id]
            );

            if (emprunts.length === 0) {
                await rollbackTransaction(connection);
                return { found: false, returned: false };
            }

            const emprunt = emprunts[0];
            if (Number(emprunt.status) !== 0) {
                await rollbackTransaction(connection);
                return { found: true, returned: false };
            }

            await runConnectionQuery(
                connection,
                `UPDATE livre_emprunt
                 SET status = 1,
                     dateReelRetour = COALESCE(NULLIF(dateReelRetour, '0000-00-00'), CURRENT_DATE)
                 WHERE id = ?`,
                [id]
            );

            await runConnectionQuery(
                connection,
                'UPDATE livre SET disponible = TRUE WHERE id_livre = ?',
                [emprunt.id_livre]
            );

            const retourEnRetard = Number(emprunt.retour_en_retard) === 1;
            await runConnectionQuery(
                connection,
                `UPDATE adherent
                 SET nbrLivreEmp = GREATEST(COALESCE(nbrLivreEmp, 0) - 1, 0),
                     sanctionner = CASE
                         WHEN ? = 1 AND COALESCE(penaliser, 0) + 1 >= 3 THEN TRUE
                         ELSE sanctionner
                     END,
                     penaliser = COALESCE(penaliser, 0) + ?
                 WHERE id_adh = ?`,
                [retourEnRetard ? 1 : 0, retourEnRetard ? 1 : 0, emprunt.code_pers]
            );

            const adherents = await runConnectionQuery(
                connection,
                'SELECT penaliser, sanctionner FROM adherent WHERE id_adh = ? LIMIT 1',
                [emprunt.code_pers]
            );

            await commitTransaction(connection);
            return {
                found: true,
                returned: true,
                retourEnRetard,
                penaliser: Number(adherents[0]?.penaliser) || 0,
                sanctionner: Boolean(adherents[0]?.sanctionner)
            };
        } catch (error) {
            await rollbackTransaction(connection);
            throw error;
        } finally {
            connection.release();
        }
    }

    // DELETE
    static async deleteLivreEmprunt(id) {
        const connection = await getConnection();

        try {
            await beginTransaction(connection);

            const emprunts = await runConnectionQuery(
                connection,
                'SELECT id, code_pers, id_livre, status FROM livre_emprunt WHERE id = ? FOR UPDATE',
                [id]
            );

            if (emprunts.length === 0) {
                await rollbackTransaction(connection);
                return null;
            }

            const emprunt = emprunts[0];
            const estNonRendu = Number(emprunt.status) === 0;

            await runConnectionQuery(
                connection,
                'DELETE FROM livre_emprunt WHERE id = ?',
                [id]
            );

            if (estNonRendu) {
                await runConnectionQuery(
                    connection,
                    'UPDATE livre SET disponible = TRUE WHERE id_livre = ?',
                    [emprunt.id_livre]
                );
                await runConnectionQuery(
                    connection,
                    'UPDATE adherent SET nbrLivreEmp = GREATEST(COALESCE(nbrLivreEmp, 0) - 1, 0) WHERE id_adh = ?',
                    [emprunt.code_pers]
                );
            }

            await commitTransaction(connection);
            return {
                deleted: true,
                estNonRendu,
                id_livre: emprunt.id_livre,
                id_adh: emprunt.code_pers
            };
        } catch (error) {
            await rollbackTransaction(connection);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async deleteLivreEmprunts(ids) {
        const connection = await getConnection();

        try {
            await beginTransaction(connection);
            const emprunts = await runConnectionQuery(
                connection,
                'SELECT id, code_pers, id_livre, status FROM livre_emprunt WHERE id IN (?) FOR UPDATE',
                [ids]
            );

            if (emprunts.length === 0) {
                await rollbackTransaction(connection);
                return { deleted: 0, restoredBooks: 0 };
            }

            const nonRendus = emprunts.filter(emprunt => Number(emprunt.status) === 0);
            const livreIds = [...new Set(nonRendus.map(emprunt => Number(emprunt.id_livre)).filter(Boolean))];
            const compteurs = new Map();
            nonRendus.forEach(emprunt => {
                const adherentId = Number(emprunt.code_pers);
                if (adherentId) compteurs.set(adherentId, (compteurs.get(adherentId) || 0) + 1);
            });

            if (livreIds.length > 0) {
                await runConnectionQuery(
                    connection,
                    'UPDATE livre SET disponible = TRUE WHERE id_livre IN (?)',
                    [livreIds]
                );
            }

            if (compteurs.size > 0) {
                const compteurEntries = [...compteurs.entries()];
                const cases = compteurEntries.map(() => 'WHEN ? THEN ?').join(' ');
                const caseValues = compteurEntries.flatMap(([adherentId, quantite]) => [adherentId, quantite]);
                const adherentIds = compteurEntries.map(([adherentId]) => adherentId);
                await runConnectionQuery(
                    connection,
                    `UPDATE adherent
                     SET nbrLivreEmp = GREATEST(
                         COALESCE(nbrLivreEmp, 0) - CASE id_adh ${cases} ELSE 0 END,
                         0
                     )
                     WHERE id_adh IN (?)`,
                    [...caseValues, adherentIds]
                );
            }

            const deleteResult = await runConnectionQuery(
                connection,
                'DELETE FROM livre_emprunt WHERE id IN (?)',
                [ids]
            );

            await commitTransaction(connection);
            return { deleted: deleteResult.affectedRows, restoredBooks: livreIds.length };
        } catch (error) {
            await rollbackTransaction(connection);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = LivreEmpruntModel;
