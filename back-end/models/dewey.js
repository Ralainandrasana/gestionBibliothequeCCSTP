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
    static async addDewey(code, titre, description) {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO dewey(code, titre, description) VALUES(?, ?, ?)', [code, titre, description], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // UPDATE
    static async updateDewey(code, titre, description) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE dewey SET titre = ?, description = ? WHERE code = ?', [titre, description, code], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // DELETE
    static async deleteDewey(code) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM dewey WHERE code = ?', [code], (error, result) => {
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
