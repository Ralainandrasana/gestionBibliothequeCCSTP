const db = require('../config/db');

class LivreModel {
    // READ
    static async getLivres() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM livre', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // CREATE
    static async addLivre(data) {
        return new Promise((resolve, reject) => {
            const { Type, titre, sous_titre, auteur, editeur, deway, cote, ISBN, langue_pays, dimension, nbre_page, etat, status, date_status, photo, anneeEdition, disponible, idOeuvre } = data;
            db.query('INSERT INTO livre(Type, titre, sous_titre, auteur, editeur, deway, cote, ISBN, langue_pays, dimension, nbre_page, etat, status, date_status, photo, anneeEdition, disponible, idOeuvre) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                     [Type, titre, sous_titre, auteur, editeur, deway, cote, ISBN, langue_pays, dimension, nbre_page, etat, status, date_status, photo, anneeEdition, disponible, idOeuvre], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // UPDATE
    static async updateLivre(id_livre, data) {
        return new Promise((resolve, reject) => {
            const { Type, titre, sous_titre, auteur, editeur, deway, cote, ISBN, langue_pays, dimension, nbre_page, etat, status, date_status, photo, anneeEdition, disponible, idOeuvre } = data;
            db.query('UPDATE livre SET Type = ?, titre = ?, sous_titre = ?, auteur = ?, editeur = ?, deway = ?, cote = ?, ISBN = ?, langue_pays = ?, dimension = ?, nbre_page = ?, etat = ?, status = ?, date_status = ?, photo = ?, anneeEdition = ?, disponible = ?, idOeuvre = ? WHERE id_livre = ?', 
                     [Type, titre, sous_titre, auteur, editeur, deway, cote, ISBN, langue_pays, dimension, nbre_page, etat, status, date_status, photo, anneeEdition, disponible, idOeuvre, id_livre], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // DELETE
    static async deleteLivre(id_livre) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM livre WHERE id_livre = ?', [id_livre], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

module.exports = LivreModel;
