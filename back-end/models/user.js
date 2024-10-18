const db = require('../config/db');

class UserModel {
	//READ
	static async getUsers() {
		return new Promise((resolve, reject) => {
			db.query('SELECT * FROM user', [], (error, result) => {
				if (error) {
					reject(error); // Rejeter la promesse en cas d'erreur
				} else {
					resolve(result); // Résoudre la promesse avec les résultats
				}
			});
		});
	}
	//CREATE
	static async addUser(nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id) {
		return new Promise((resolve, reject) => {
			db.query('insert into user(nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id], (error, result) => {
				if (error) {
					reject(error); // Rejeter la promesse en cas d'erreur
				} else {
					resolve(result); // Résoudre la promesse avec les résultats
				}
			});
		});
	}
	//UPDATE
	static async updateUser(id, nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id) {
		return new Promise((resolve, reject) => {
			db.query('UPDATE user SET nom = ?, pswd = ?, email = ?, photo = ?, roles = ?, login_session_key = ?, email_status = ?, password_reset_key = ?, account_status = ?, user_role_id = ? WHERE id = ?', 
			[nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id, id], 
			(error, result) => {
				if (error) {
					reject(error); // Rejeter la promesse en cas d'erreur
				} else {
					resolve(result); // Résoudre la promesse avec les résultats
				}
			});
		});
	}
	//DELETE
	static async deleteUser(id) {
		return new Promise((resolve, reject) => {
			db.query('DELETE from user WHERE id = ?', 
			[id], 
			(error, result) => {
				if (error) {
					reject(error); // Rejeter la promesse en cas d'erreur
				} else {
					resolve(result); // Résoudre la promesse avec les résultats
				}
			});
		});
	}
	// READ
static async checkUserIfExist(nom) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM user WHERE nom = ?', [nom], (error, result) => {
            if (error) {
                reject(error); // Rejeter la promesse en cas d'erreur
            } else {
                if (result.length > 0) {
                    resolve(result[0]); // Utilisateur trouvé, retourner le premier résultat
                } else {
                    resolve(null); // Aucun utilisateur trouvé
                }
            }
        });
    });
}
//READ
static async getInfoUser(nom) {
	return new Promise((resolve, reject) => {
		db.query('SELECT * FROM user where nom = ?', [nom], (error, result) => {
			if (error) {
				reject(error); // Rejeter la promesse en cas d'erreur
			} else {
				resolve(result); // Résoudre la promesse avec les résultats
			}
		});
	});
}

}

module.exports = UserModel;
