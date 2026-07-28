const db = require('../config/db');

class LivreModel {
    // READ
    static async getLivres() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM livre order by id_livre desc', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
     // livre non dispo
     static async getLivresNonDispo() {
        return new Promise((resolve, reject) => {
            db.query('select id_livre from livre where disponible = false;', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
// READ
static async getAutoCompleteLivres(query) {
    return new Promise((resolve, reject) => {
        // Utiliser le bon format pour LIKE
        db.query("SELECT * FROM livrenum WHERE livrcode LIKE ?", [`%${query}%`], (error, result) => {
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
            const { Type, titre, sous_titre, auteur, editeur, deway, cote, ISBN, langue_pays, dimension, nbre_page, etat, status, date_status } = data;
            db.query('INSERT INTO livre(Type, titre, sous_titre, auteur, editeur, deway, cote, ISBN, langue_pays, dimension, nbre_page, etat, status, date_status, photo, anneeEdition, disponible, idOeuvre) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                     [Type, titre, sous_titre, auteur, editeur, deway, cote, ISBN, langue_pays, dimension, nbre_page, etat, status, date_status, '', '0000-00-00', true, null], (error, result) => {
                if (error) {
                    console.log(error);
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

    // UPDATE
    static async setDisponible(id_livre) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE livre SET disponible = false WHERE id_livre = ?', 
                     [id_livre], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // UPDATE
    static async setDisponibleRendu(id_livre) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE livre SET disponible = true WHERE id_livre = ?', 
                     [id_livre], (error, result) => {
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
    // effectif total des livres
    static async getEffectifLivre() {
        return new Promise((resolve, reject) => {
            db.query('select count(*) as effectifLivre from livre', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
    // effectif par type des livres
    static async getEffectifParTypelivre() {
        return new Promise((resolve, reject) => {
            db.query('select Type, count(*) as effectif from livre group by Type', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
    // effectif par Dewey des livres
    static async getEffectifParDeweylivre() {
        return new Promise((resolve, reject) => {
            db.query('select deway, count(*) as effectif from livre group by deway', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // classement livre
    static async getClassementLivres() {
        return new Promise((resolve, reject) => {
            db.query("SELECT ROW_NUMBER() OVER(ORDER BY COUNT(le.id_livre) DESC) AS rang, le.id_livre, l.titre, l.deway, l.sous_titre, l.auteur, count(le.id_livre) as nombreEmprunt FROM `livre_emprunt` le left join (`livre` l left join `oeuvre` o on l.idOeuvre = o.id) on le.id_livre = l.id_livre where le.id_livre != '' group by le.id_livre order by nombreEmprunt desc", [], (error, result) => {
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
