const db = require('../config/db');

class DeweyModel {
    // READ
    static async getDeweys() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM dewey', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // CREATE
    static async addDewey(titre, description) {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO dewey(titre, description) VALUES(?, ?)', [titre, description], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // UPDATE
    static async updateDewey(id, titre, description) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE dewey SET titre = ?, description = ? WHERE id = ?', [titre, description, id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // DELETE
    static async deleteDewey(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM dewey WHERE id = ?', [id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

module.exports = DeweyModel;
