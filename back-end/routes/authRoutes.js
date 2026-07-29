const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { ALL_ROLES, ROLES, normalizeRole } = require('../config/accessControl');

// Routes publiques
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/check-session', authController.checkSession);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Routes protégées (nécessitent une authentification)
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

// Routes admin (exemple)
router.get('/admin/users', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
	try {
		const UserModel = require('../models/User');
		const users = await UserModel.getUsers();
		res.json({
			success: true,
			users
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur'
		});
	}
});

// Route pour changer le statut d'un utilisateur (admin)
router.put('/admin/users/:id/status', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { account_status } = req.body;
		const UserModel = require('../models/User');
		const allowedStatuses = ['active', 'pending', 'blocked'];
		const normalizedStatus = String(account_status || '').trim().toLowerCase();

		if (!allowedStatuses.includes(normalizedStatus)) {
			return res.status(400).json({
				success: false,
				message: 'Statut de compte invalide'
			});
		}
		
		const result = await UserModel.updateAccountStatus(id, normalizedStatus);
		
		if (result.affectedRows > 0) {
			res.json({
				success: true,
				message: 'Statut du compte mis à jour'
			});
		} else {
			res.status(404).json({
				success: false,
				message: 'Utilisateur non trouvé'
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur'
		});
	}
});

// Route pour attribuer un rôle (admin uniquement)
router.put('/admin/users/:id/role', authMiddleware, roleMiddleware([ROLES.ADMIN]), async (req, res) => {
	try {
		const { id } = req.params;
		const role = normalizeRole(req.body.roles);

		if (!ALL_ROLES.includes(role)) {
			return res.status(400).json({
				success: false,
				message: 'Rôle utilisateur invalide'
			});
		}

		if (Number(id) === Number(req.session.userId) && role !== ROLES.ADMIN) {
			return res.status(400).json({
				success: false,
				message: 'Vous ne pouvez pas retirer votre propre rôle administrateur'
			});
		}

		const UserModel = require('../models/User');
		const result = await UserModel.updateRole(id, role);

		if (!result.affectedRows) {
			return res.status(404).json({
				success: false,
				message: 'Utilisateur non trouvé'
			});
		}

		res.json({
			success: true,
			message: 'Rôle utilisateur mis à jour'
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur'
		});
	}
});

module.exports = router;
