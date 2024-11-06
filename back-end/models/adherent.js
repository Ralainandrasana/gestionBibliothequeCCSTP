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
            db.query('select count(*) as effectifAdherent from adherent', [], (error, result) => {
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
            db.query('select categorie, count(*) as effectif from adherent group by categorie', [], (error, result) => {
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
