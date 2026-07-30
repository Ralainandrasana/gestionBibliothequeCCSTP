const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class UserModel {
	// READ - Récupérer tous les utilisateurs
	static async getUsers() {
		return new Promise((resolve, reject) => {
			db.query('SELECT id, nom, email, photo, roles, email_status, account_status, user_role_id FROM user', [], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// CREATE - Ajouter un utilisateur
	static async addUser(nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id) {
		return new Promise((resolve, reject) => {
			db.query('INSERT INTO user(nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
			[nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id], 
			(error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// UPDATE - Mettre à jour un utilisateur
	static async updateUser(id, nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id) {
		return new Promise((resolve, reject) => {
			db.query('UPDATE user SET nom = ?, pswd = ?, email = ?, photo = ?, roles = ?, login_session_key = ?, email_status = ?, password_reset_key = ?, account_status = ?, user_role_id = ? WHERE id = ?', 
			[nom, pswd, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id, id], 
			(error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// UPDATE - Mettre à jour les informations administratives sans toucher au mot de passe
	static async updateUserDetails(id, nom, email, photo, roles, accountStatus, userRoleId) {
		return new Promise((resolve, reject) => {
			db.query(
				'UPDATE user SET nom = ?, email = ?, photo = ?, roles = ?, account_status = ?, user_role_id = ? WHERE id = ?',
				[nom, email, photo, roles, accountStatus, userRoleId, id],
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

	// DELETE - Supprimer un utilisateur
	static async deleteUser(id) {
		return new Promise((resolve, reject) => {
			db.query('DELETE FROM user WHERE id = ?', [id], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// READ - Vérifier si un utilisateur existe
	static async checkUserIfExist(nom) {
		return new Promise((resolve, reject) => {
			db.query('SELECT * FROM user WHERE nom = ?', [nom], (error, result) => {
				if (error) {
					reject(error);
				} else {
					if (result.length > 0) {
						resolve(result[0]);
					} else {
						resolve(null);
					}
				}
			});
		});
	}

	// READ - Récupérer les informations d'un utilisateur
	static async getInfoUser(nom) {
		return new Promise((resolve, reject) => {
			db.query('SELECT * FROM user WHERE nom = ?', [nom], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// READ - Récupérer un utilisateur par son ID
	static async getUserById(id) {
		return new Promise((resolve, reject) => {
			db.query('SELECT id, nom, email, photo, roles, email_status, account_status, user_role_id FROM user WHERE id = ?', [id], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result.length > 0 ? result[0] : null);
				}
			});
		});
	}

	// READ - Récupérer un utilisateur par son email
	static async getUserByEmail(email) {
		return new Promise((resolve, reject) => {
			db.query('SELECT * FROM user WHERE email = ?', [email], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result.length > 0 ? result[0] : null);
				}
			});
		});
	}

	// UPDATE - Mettre à jour le login_session_key
	static async updateSessionKey(userId, sessionKey) {
		return new Promise((resolve, reject) => {
			db.query('UPDATE user SET login_session_key = ? WHERE id = ?', [sessionKey, userId], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// UPDATE - Mettre à jour le statut du compte
	static async updateAccountStatus(userId, status) {
		return new Promise((resolve, reject) => {
			db.query('UPDATE user SET account_status = ? WHERE id = ?', [status, userId], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// UPDATE - Mettre à jour le rôle applicatif
	static async updateRole(userId, role) {
		return new Promise((resolve, reject) => {
			db.query('UPDATE user SET roles = ? WHERE id = ?', [role, userId], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// UPDATE - Mettre à jour le mot de passe
	static async updatePassword(userId, newPassword) {
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		return new Promise((resolve, reject) => {
			db.query('UPDATE user SET pswd = ? WHERE id = ?', [hashedPassword, userId], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// UPDATE - Mettre à jour le profil (sans mot de passe)
	static async updateProfile(userId, nom, email, photo) {
		return new Promise((resolve, reject) => {
			db.query('UPDATE user SET nom = ?, email = ?, photo = ? WHERE id = ?', [nom, email, photo, userId], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// CREATE - Générer un token de réinitialisation de mot de passe
	static async generatePasswordResetKey(email) {
		const resetKey = crypto.randomBytes(32).toString('hex');
		return new Promise((resolve, reject) => {
			db.query('UPDATE user SET password_reset_key = ? WHERE email = ?', [resetKey, email], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result.affectedRows > 0 ? resetKey : null);
				}
			});
		});
	}

	// READ - Vérifier le token de réinitialisation
	static async verifyPasswordResetKey(resetKey) {
		return new Promise((resolve, reject) => {
			db.query('SELECT * FROM user WHERE password_reset_key = ?', [resetKey], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result.length > 0 ? result[0] : null);
				}
			});
		});
	}

	// UPDATE - Réinitialiser le mot de passe avec le token
	static async resetPasswordWithKey(resetKey, newPassword) {
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		return new Promise((resolve, reject) => {
			db.query('UPDATE user SET pswd = ?, password_reset_key = NULL WHERE password_reset_key = ?', [hashedPassword, resetKey], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// READ - Vérifier si l'email existe déjà
	static async emailExists(email) {
		return new Promise((resolve, reject) => {
			db.query('SELECT id FROM user WHERE email = ?', [email], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result.length > 0);
				}
			});
		});
	}

	// READ - Vérifier si le nom d'utilisateur existe déjà
	static async usernameExists(nom) {
		return new Promise((resolve, reject) => {
			db.query('SELECT id FROM user WHERE nom = ?', [nom], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result.length > 0);
				}
			});
		});
	}

	// Helper - Hash du mot de passe
	static async hashPassword(password) {
		return await bcrypt.hash(password, 10);
	}

	// Helper - Vérification du mot de passe
	static async validatePassword(plainPassword, hashedPassword) {
		return await bcrypt.compare(plainPassword, hashedPassword);
	}

	// READ - Récupérer les utilisateurs par rôle
	static async getUsersByRole(role) {
		return new Promise((resolve, reject) => {
			db.query('SELECT id, nom, email, photo, roles, email_status, account_status FROM user WHERE roles = ?', [role], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	// UPDATE - Mettre à jour le statut email
	static async updateEmailStatus(userId, status) {
		return new Promise((resolve, reject) => {
			db.query('UPDATE user SET email_status = ? WHERE id = ?', [status, userId], (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}
}

module.exports = UserModel;
