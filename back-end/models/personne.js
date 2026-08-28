const db = require('../config/db');
const { runPaginatedQuery } = require('../utils/pagination');

class PersonneModel {
    // READ
    static async getPersonnes(pagination = null) {
        const baseSql = `SELECT id, code, nom, prenom, date_nais, CIN,
                                adresse, profession, tel, photo
                         FROM personne`;
        if (pagination) {
            return runPaginatedQuery({
                baseSql,
                searchColumns: ['id', 'code', 'nom', 'prenom', 'adresse', 'profession', 'tel', 'CIN'],
                orderBy: 'source.id DESC',
                totalMode: 'separate',
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

    static async getPersonneById(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT id, code, nom, prenom, date_nais, lieu, CIN, adresse,
                        profession, departement, tel, date_inscription, photo
                 FROM personne
                 WHERE id = ?
                 LIMIT 1`,
                [id], (error, result) => {
                if (error) reject(error);
                else resolve(result[0] || null);
                }
            );
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
            const search = String(query || '').trim().slice(0, 100);
            if (!search) return resolve([]);
            db.query(
                `SELECT id, tri
                 FROM tripers
                 WHERE tri LIKE ?
                 ORDER BY (tri LIKE ?) DESC, tri ASC
                 LIMIT 20`,
                [`%${search}%`, `${search}%`],
                (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
                }
            );
        });
    }

    static async deletePersonnes(ids) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM personne WHERE id IN (?)', [ids], (error, result) => {
                if (error) reject(error);
                else resolve(result);
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
