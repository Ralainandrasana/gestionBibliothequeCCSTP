const db = require('../config/db');

class LivreEmpruntModel {
    // READ
    static async getLivreEmprunts() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM livre_emprunt', [], (error, result) => {
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
            const { code_pers, id_livre, date_emprunt, date_retour, status, dateReelRetour, renouvelable } = data;
            db.query('INSERT INTO livre_emprunt(code_pers, id_livre, date_emprunt, date_retour, status, dateReelRetour, renouvelable) VALUES(?, ?, ?, ?, ?, ?, ?)', 
                     [code_pers, id_livre, date_emprunt, date_retour, status, dateReelRetour, renouvelable], (error, result) => {
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
