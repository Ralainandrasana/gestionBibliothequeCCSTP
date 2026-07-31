const db = require('../config/db');

class AdherentModel {
    // READ
    static async getAdherents() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM adherent a left outer join personne p on a.id_pers = p.id order by id_adh desc', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }// READ 

//emprunt Invalide
    static async getEmpruntInvalide() {
        return new Promise((resolve, reject) => {
            db.query('select id_adh from adherent a where a.sanctionner = true or (a.nbrLivreEmp >= 2 or CURRENT_DATE >= a.date_fin);', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async getAutoCompleteAdherents(query) {//hello
        return new Promise((resolve, reject) => {
            // Utiliser le bon format pour LIKE
            db.query("SELECT * FROM adherent_tri WHERE trix LIKE ?", [`%${query}%`], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async findByPersonId(id_pers, excludedAdherentId = null) {
        return new Promise((resolve, reject) => {
            const query = excludedAdherentId
                ? 'SELECT id_adh FROM adherent WHERE id_pers = ? AND id_adh <> ? LIMIT 1'
                : 'SELECT id_adh FROM adherent WHERE id_pers = ? LIMIT 1';
            const parameters = excludedAdherentId ? [id_pers, excludedAdherentId] : [id_pers];

            db.query(query, parameters, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.length > 0 ? result[0] : null);
                }
            });
        });
    }
//search adherant
    static async searchAdherant(id_adh) {//hello
        return new Promise((resolve, reject) => {
            // Utiliser le bon format pour LIKE
            db.query("SELECT * FROM adherent WHERE id_adh = ?", [id_adh], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    //evolution inscription
    static async getEvolutionInscription() {
        return new Promise((resolve, reject) => {
            // Utiliser le bon format pour LIKE
            db.query("SELECT DATE_FORMAT(date_reinscription, '%b') AS mois, COUNT(*) AS effectifIns FROM adherent WHERE date_reinscription >= DATE_SUB(LAST_DAY(CURDATE()), INTERVAL 10 MONTH) AND date_reinscription <= LAST_DAY(CURDATE()) GROUP BY DATE_FORMAT(date_reinscription, '%M'), MONTH(date_reinscription) ORDER BY MIN(date_reinscription);", [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async getClassementAdherents() {
        return new Promise((resolve, reject) => {
            // Utiliser le bon format pour LIKE
            db.query("SELECT ROW_NUMBER() OVER(ORDER BY COUNT(code_pers) DESC) AS rang, code, nom, prenom, categorie, count(code_pers) as nombreEmpruntEffectue FROM `livre_emprunt` le left join (`adherent` a left join `personne` p on a.id_pers = p.id) on le.code_pers = a.id_adh where id_adh is not null and (le.date_emprunt <= '2024-12-31' and le.date_emprunt >= '2024-01-01') group by code_pers order by nombreEmpruntEffectue desc", [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // CREATE
    static async addAdherent(data) {
        return new Promise((resolve, reject) => {
            const { categorie, date_reinscription, date_fin, id_pers } = data;
            db.query('INSERT INTO adherent(categorie, date_reinscription, date_fin, type, id_pers, penaliser, sanctionner, nbrLivreEmp) VALUES(?, ?, ?, ?, ?, ?, ?, ?)', 
                     [categorie, date_reinscription, date_fin, 'Livre', id_pers, 1, false, 0], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // UPDATE
    static async updateAdherent(id_adh, data) {
        return new Promise((resolve, reject) => {
            const { categorie, date_reinscription, date_fin, type, id_pers, penaliser, sanctionner, nbrLivreEmp } = data;
            db.query('UPDATE adherent SET categorie = ?, date_reinscription = ?, date_fin = ?, type = ?, id_pers = ?, penaliser = ?, sanctionner = ?, nbrLivreEmp = ? WHERE id_adh = ?', 
                     [categorie, date_reinscription, date_fin, type, id_pers, penaliser, sanctionner, nbrLivreEmp, id_adh], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // AVERTIR ADHERANT
    static async avertirAdherant(id_adh) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE adherent SET penaliser = penaliser + 1, sanctionner = CASE WHEN penaliser + 1 >= 3 THEN TRUE ELSE sanctionner END WHERE id_adh = ?;', 
                     [id_adh], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

     // increment nbr livreEmp
     static async incrementNbrLivreEmp(id_adh) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE adherent SET nbrLivreEmp = nbrLivreEmp + 1 WHERE id_adh = ?', 
                     [id_adh], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // decrement nbr livreEmp
    static async decrementNbrLivreEmp(id_adh) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE adherent SET nbrLivreEmp = nbrLivreEmp - 1 WHERE id_adh = ?', 
                     [id_adh], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // DELETE
    static async deleteAdherent(id_adh) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM adherent WHERE id_adh = ?', [id_adh], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
    // effectif total des adherents
    static async getEffectifAdherent() {
        return new Promise((resolve, reject) => {
            db.query('SELECT count(*) as effectifAdherent FROM adherent a left outer join personne p on a.id_pers = p.id where p.code is not null order by id_adh desc', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
    // effectif par categorie des adherents
    static async getEffectifParCategorieAdherent() {
        return new Promise((resolve, reject) => {
            db.query('select a.categorie, count(*) as effectif from adherent a left outer join personne p on a.id_pers = p.id where p.code is not null group by a.categorie', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

module.exports = AdherentModel;
