const UserModel = require('../models/User');
const crypto = require('crypto');
const { ROLES, normalizeRole } = require('../config/accessControl');

const isActiveAccount = (status) => String(status || '').trim().toLowerCase() === 'active';

const authController = {
	// Connexion
	async login(req, res) {
		try {
			const { nom, pswd } = req.body;

			// Validation des champs
			if (!nom || !pswd) {
				return res.status(400).json({
					success: false,
					message: 'Nom d\'utilisateur et mot de passe requis'
				});
			}

			// Recherche de l'utilisateur
			const user = await UserModel.checkUserIfExist(nom);
			
			if (!user) {
				return res.status(401).json({
					success: false,
					message: 'Identifiants incorrects'
				});
			}

			// Vérifier le statut du compte
			if (!isActiveAccount(user.account_status)) {
				return res.status(403).json({
					success: false,
					message: 'Votre compte est désactivé. Veuillez contacter l\'administrateur.'
				});
			}

			// Vérification du mot de passe
			const isValidPassword = await UserModel.validatePassword(pswd, user.pswd);
			
			if (!isValidPassword) {
				return res.status(401).json({
					success: false,
					message: 'Identifiants incorrects'
				});
			}

			// Générer un session key
			const sessionKey = crypto.randomBytes(32).toString('hex');
			
			// Mettre à jour le login_session_key
			await UserModel.updateSessionKey(user.id, sessionKey);

			// Création de la session
			req.session.userId = user.id;
			req.session.nom = user.nom;
			const role = normalizeRole(user.roles);
			req.session.roles = role;
			req.session.email = user.email;
			req.session.sessionKey = sessionKey;

			// Réponse (sans le mot de passe)
			const userResponse = {
				id: user.id,
				nom: user.nom,
				email: user.email,
				photo: user.photo,
				roles: role,
				user_role_id: user.user_role_id,
				email_status: user.email_status,
				account_status: user.account_status
			};

			res.json({
				success: true,
				message: 'Connexion réussie',
				user: userResponse
			});

		} catch (error) {
			console.error('Erreur lors de la connexion:', error);
			res.status(500).json({
				success: false,
				message: 'Erreur serveur lors de la connexion'
			});
		}
	},

	// Déconnexion
	async logout(req, res) {
		try {
			// Supprimer la session key
			if (req.session.userId) {
				await UserModel.updateSessionKey(req.session.userId, null);
			}

			req.session.destroy((err) => {
				if (err) {
					return res.status(500).json({
						success: false,
						message: 'Erreur lors de la déconnexion'
					});
				}
				res.clearCookie('bibliotheque.sid');
				res.json({
					success: true,
					message: 'Déconnexion réussie'
				});
			});
		} catch (error) {
			console.error('Erreur lors de la déconnexion:', error);
			res.status(500).json({
				success: false,
				message: 'Erreur serveur lors de la déconnexion'
			});
		}
	},

	// Vérification de session
	async checkSession(req, res) {
		try {
			if (!req.session.userId) {
				return res.status(401).json({
					success: false,
					message: 'Session invalide'
				});
			}

			const user = await UserModel.getUserById(req.session.userId);
			
			if (!user) {
				req.session.destroy();
				return res.status(401).json({
					success: false,
					message: 'Utilisateur non trouvé'
				});
			}

			// Vérifier le statut du compte
			if (!isActiveAccount(user.account_status)) {
				req.session.destroy();
				return res.status(403).json({
					success: false,
					message: 'Compte désactivé'
				});
			}

			const role = normalizeRole(user.roles);
			req.session.roles = role;

			res.json({
				success: true,
				user: {
					id: user.id,
					nom: user.nom,
					email: user.email,
					photo: user.photo,
					roles: role,
					user_role_id: user.user_role_id,
					email_status: user.email_status,
					account_status: user.account_status
				}
			});
		} catch (error) {
			console.error('Erreur lors de la vérification de session:', error);
			res.status(500).json({
				success: false,
				message: 'Erreur serveur'
			});
		}
	},

	// Inscription
	async register(req, res) {
		try {
			const { nom, pswd, email, photo = null } = req.body;

			// Validation
			if (!nom || !pswd || !email) {
				return res.status(400).json({
					success: false,
					message: 'Tous les champs sont requis'
				});
			}

			// Vérifier si l'utilisateur existe déjà
			const usernameExists = await UserModel.usernameExists(nom);
			if (usernameExists) {
				return res.status(409).json({
					success: false,
					message: 'Ce nom d\'utilisateur est déjà pris'
				});
			}

			const emailExists = await UserModel.emailExists(email);
			if (emailExists) {
				return res.status(409).json({
					success: false,
					message: 'Cet email est déjà utilisé'
				});
			}

			// Hasher le mot de passe
			const hashedPassword = await UserModel.hashPassword(pswd);

			// Définir les valeurs par défaut
			// Une inscription publique reçoit toujours le rôle le moins privilégié.
			const roles = ROLES.INVITER;
			const user_role_id = Number(process.env.DEFAULT_REGISTER_ROLE_ID || 1);
			const login_session_key = null;
			const email_status = 'pending';
			const password_reset_key = null;
			const account_status = 'pending';

			// Créer l'utilisateur
			const result = await UserModel.addUser(
				nom,
				hashedPassword,
				email,
				photo,
				roles,
				login_session_key,
				email_status,
				password_reset_key,
				account_status,
				user_role_id
			);

			res.status(201).json({
				success: true,
				message: 'Inscription réussie',
				userId: result.insertId
			});

		} catch (error) {
			console.error('Erreur lors de l\'inscription:', error);
			res.status(500).json({
				success: false,
				message: 'Erreur serveur lors de l\'inscription'
			});
		}
	},

	// Profil utilisateur
	async getProfile(req, res) {
		try {
			const user = await UserModel.getUserById(req.session.userId);
			
			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'Utilisateur non trouvé'
				});
			}

			res.json({
				success: true,
				user
			});
		} catch (error) {
			console.error('Erreur lors de la récupération du profil:', error);
			res.status(500).json({
				success: false,
				message: 'Erreur serveur'
			});
		}
	},

	// Mettre à jour le profil
	async updateProfile(req, res) {
		try {
			const { nom, email, photo } = req.body;
			const userId = req.session.userId;

			// Vérifier si l'email est déjà utilisé par un autre utilisateur
			const user = await UserModel.getUserById(userId);
			if (email !== user.email) {
				const emailExists = await UserModel.emailExists(email);
				if (emailExists) {
					return res.status(409).json({
						success: false,
						message: 'Cet email est déjà utilisé'
					});
				}
			}

			// Vérifier si le nom est déjà utilisé par un autre utilisateur
			if (nom !== user.nom) {
				const usernameExists = await UserModel.usernameExists(nom);
				if (usernameExists) {
					return res.status(409).json({
						success: false,
						message: 'Ce nom d\'utilisateur est déjà pris'
					});
				}
			}

			const updated = await UserModel.updateProfile(userId, nom, email, photo);
			
			if (updated.affectedRows > 0) {
				// Mettre à jour la session
				req.session.nom = nom;
				req.session.email = email;
				
				res.json({
					success: true,
					message: 'Profil mis à jour'
				});
			} else {
				res.status(400).json({
					success: false,
					message: 'Aucune modification effectuée'
				});
			}
		} catch (error) {
			console.error('Erreur lors de la mise à jour du profil:', error);
			res.status(500).json({
				success: false,
				message: 'Erreur serveur'
			});
		}
	},

	// Changer le mot de passe
	async changePassword(req, res) {
		try {
			const { currentPassword, newPassword } = req.body;
			const userId = req.session.userId;

			// Récupérer l'utilisateur avec son mot de passe
			const user = await UserModel.checkUserIfExist(req.session.nom);
			
			// Vérifier le mot de passe actuel
			const isValid = await UserModel.validatePassword(currentPassword, user.pswd);
			if (!isValid) {
				return res.status(401).json({
					success: false,
					message: 'Mot de passe actuel incorrect'
				});
			}

			// Changer le mot de passe
			const changed = await UserModel.updatePassword(userId, newPassword);
			
			if (changed.affectedRows > 0) {
				res.json({
					success: true,
					message: 'Mot de passe changé avec succès'
				});
			} else {
				res.status(500).json({
					success: false,
					message: 'Erreur lors du changement de mot de passe'
				});
			}
		} catch (error) {
			console.error('Erreur lors du changement de mot de passe:', error);
			res.status(500).json({
				success: false,
				message: 'Erreur serveur'
			});
		}
	},

	// Demander la réinitialisation du mot de passe
	async requestPasswordReset(req, res) {
		try {
			const { email } = req.body;

			const user = await UserModel.getUserByEmail(email);
			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'Aucun utilisateur trouvé avec cet email'
				});
			}

			const resetKey = await UserModel.generatePasswordResetKey(email);
			
			if (resetKey) {
				// Ici vous enverriez l'email avec le lien de réinitialisation
				// Exemple: http://frontend.com/reset-password?key=${resetKey}
				
				res.json({
					success: true,
					message: 'Un email de réinitialisation a été envoyé'
				});
			} else {
				res.status(500).json({
					success: false,
					message: 'Erreur lors de la génération du token'
				});
			}
		} catch (error) {
			console.error('Erreur lors de la demande de réinitialisation:', error);
			res.status(500).json({
				success: false,
				message: 'Erreur serveur'
			});
		}
	},

	// Réinitialiser le mot de passe avec le token
	async resetPassword(req, res) {
		try {
			const { resetKey, newPassword } = req.body;

			if (!resetKey || !newPassword) {
				return res.status(400).json({
					success: false,
					message: 'Token et nouveau mot de passe requis'
				});
			}

			const user = await UserModel.verifyPasswordResetKey(resetKey);
			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'Token invalide ou expiré'
				});
			}

			const result = await UserModel.resetPasswordWithKey(resetKey, newPassword);
			
			if (result.affectedRows > 0) {
				res.json({
					success: true,
					message: 'Mot de passe réinitialisé avec succès'
				});
			} else {
				res.status(500).json({
					success: false,
					message: 'Erreur lors de la réinitialisation'
				});
			}
		} catch (error) {
			console.error('Erreur lors de la réinitialisation du mot de passe:', error);
			res.status(500).json({
				success: false,
				message: 'Erreur serveur'
			});
		}
	}
};

module.exports = authController;
