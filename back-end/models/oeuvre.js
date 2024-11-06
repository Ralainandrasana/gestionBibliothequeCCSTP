const db = require('../config/db');

class OeuvreModel {
    // READ
    static async getOeuvres() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM oeuvre', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // CREATE
    static async addOeuvre(data) {
        return new Promise((resolve, reject) => {
            const { titre, sous_titre, auteur, nbrExemplaire, nbrExemplaireDispo } = data;
            db.query('INSERT INTO oeuvre(titre, sous_titre, auteur, nbrExemplaire, nbrExemplaireDispo) VALUES(?, ?, ?, ?, ?)', 
                     [titre, sous_titre, auteur, nbrExemplaire, nbrExemplaireDispo], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // UPDATE
    static async updateOeuvre(id, data) {
        return new Promise((resolve, reject) => {
            const { titre, sous_titre, auteur, nbrExemplaire, nbrExemplaireDispo } = data;
            db.query('UPDATE oeuvre SET titre = ?, sous_titre = ?, auteur = ?, nbrExemplaire = ?, nbrExemplaireDispo = ? WHERE id = ?', 
                     [titre, sous_titre, auteur, nbrExemplaire, nbrExemplaireDispo, id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // DELETE
    static async deleteOeuvre(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM oeuvre WHERE id = ?', [id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

module.exports = OeuvreModel;
