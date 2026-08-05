const db = require('../config/db');
const { runPaginatedQuery } = require('../utils/pagination');

class PersonneModel {
    // READ
    static async getPersonnes(pagination = null) {
        const baseSql = 'SELECT * FROM personne';
        if (pagination) {
            return runPaginatedQuery({
                baseSql,
                searchColumns: ['id', 'code', 'nom', 'prenom', 'adresse', 'profession', 'tel', 'CIN'],
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

    // CREATE
    static async addPersonne(data) {
        return new Promise((resolve, reject) => {
            const { code, nom, prenom, date_nais, lieu, CIN, adresse, profession, departement, tel, date_inscription, photo } = data;
            db.query('INSERT INTO personne(code, nom, prenom, date_nais, lieu, CIN, adresse, profession, departement, tel, date_inscription, photo) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                     [code, nom, prenom, date_nais, lieu, CIN, adresse, profession, departement, tel, date_inscription, photo], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // UPDATE
    static async updatePersonne(id, data) {
        return new Promise((resolve, reject) => {
            const { code, nom, prenom, date_nais, lieu, CIN, adresse, profession, departement, tel, date_inscription, photo } = data;
            db.query('UPDATE personne SET code = ?, nom = ?, prenom = ?, date_nais = ?, lieu = ?, CIN = ?, adresse = ?, profession = ?, departement = ?, tel = ?, date_inscription = ?, photo = ? WHERE id = ?', 
                     [code, nom, prenom, date_nais, lieu, CIN, adresse, profession, departement, tel, date_inscription, photo, id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // DELETE
    static async deletePersonne(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM personne WHERE id = ?', [id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
    // READ
    static async getAutoCompletePersonnes(query) {
        return new Promise((resolve, reject) => {
            // Utiliser le bon format pour LIKE
            db.query("SELECT * FROM tripers WHERE tri LIKE ?", [`%${query}%`], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
    // READ
    static async getMatricule() {
        return new Promise((resolve, reject) => {
            db.query("select code from personne", [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
    
}

module.exports = PersonneModel;
