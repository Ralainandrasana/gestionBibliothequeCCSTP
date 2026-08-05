const db = require('../config/db');
const { runPaginatedQuery } = require('../utils/pagination');

class LivreEmpruntModel {
    // READ
    static async getLivreEmpruntsRecent(pagination = null) {
        const baseSql = 'SELECT * FROM emp_recent';
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
        const baseSql = "SELECT at.id_adh, le.id_livre, le.renouvelable, le.id, at.trix, ln.livrcode, le.date_emprunt, le.date_retour FROM (livre_emprunt le left outer join adherent_tri at on le.code_pers = at.id_adh) left outer join livrenum ln on le.id_livre = ln.id_livre where status = 0 and (at.trix is not null and ln.livrcode is not null)";
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

    // CREATE
    static async addLivreEmprunt(data) {
        return new Promise((resolve, reject) => {
            const { code_pers, id_livre, date_emprunt, date_retour } = data;
            db.query('INSERT INTO livre_emprunt(code_pers, id_livre, date_emprunt, date_retour, status, dateReelRetour, renouvelable) VALUES(?, ?, ?, ?, ?, ?, ?)', 
                     [code_pers, id_livre, date_emprunt, date_retour, 0, '0000-00-00', true], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
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
        return new Promise((resolve, reject) => {
            db.query('UPDATE livre_emprunt SET renouvelable = ?, date_emprunt = current_date, date_retour = date_add(current_date, interval 14 day) WHERE id = ?',
                     [false, id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // UPDATE
    static async rendreLivreEmprunt(id) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE livre_emprunt SET status = ? WHERE id = ?', 
                     [true, id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // DELETE
    static async deleteLivreEmprunt(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM livre_emprunt WHERE id = ?', [id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

module.exports = LivreEmpruntModel;
