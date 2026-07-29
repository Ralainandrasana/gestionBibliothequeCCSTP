const { normalizeRole } = require('../config/accessControl');

// Middleware d'authentification de base
const authMiddleware = async (req, res, next) => {
	if (!req.session.userId) {
		return res.status(401).json({
			success: false,
			message: 'Non authentifié'
		});
	}

	try {
		const UserModel = require('../models/User');
		const user = await UserModel.getUserById(req.session.userId);
		const accountStatus = String(user?.account_status || '').trim().toLowerCase();

		if (!user || accountStatus !== 'active') {
			req.session.destroy(() => {});
			return res.status(401).json({
				success: false,
				message: 'Session invalide ou compte inactif'
			});
		}

		// Le rôle est relu depuis la base pour appliquer immédiatement un changement admin.
		req.session.roles = normalizeRole(user.roles);
		req.user = user;
		next();
	} catch (error) {
		console.error('Erreur lors de la vérification de la session:', error);
		return res.status(500).json({
			success: false,
			message: 'Erreur serveur'
		});
	}
};

// Middleware pour vérifier les rôles
const roleMiddleware = (roles) => {
	const allowedRoles = roles.map(normalizeRole);

	return (req, res, next) => {
		if (!req.session.userId) {
			return res.status(401).json({
				success: false,
				message: 'Non authentifié'
			});
		}
		
		// Vérifier si l'utilisateur a le rôle requis
		const userRoles = req.session.roles || '';
		const userRolesArray = String(userRoles)
			.split(',')
			.map(normalizeRole)
			.filter(Boolean);
		
		const hasRole = allowedRoles.some(role => userRolesArray.includes(role));
		
		if (!hasRole) {
			return res.status(403).json({
				success: false,
				message: 'Accès refusé - Privilèges insuffisants'
			});
		}
		next();
	};
};

// Middleware pour vérifier la session key (sécurité supplémentaire)
const sessionKeyMiddleware = async (req, res, next) => {
	if (!req.session.userId || !req.session.sessionKey) {
		return res.status(401).json({
			success: false,
			message: 'Session invalide'
		});
	}
	
	try {
		const UserModel = require('../models/User');
		const user = await UserModel.getUserById(req.session.userId);
		
		if (!user || user.login_session_key !== req.session.sessionKey) {
			req.session.destroy();
			return res.status(401).json({
				success: false,
				message: 'Session expirée ou invalide'
			});
		}
		next();
	} catch (error) {
		console.error('Erreur lors de la vérification de la session key:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur'
		});
	}
};

// Middleware optionnel (vérifie si authentifié, mais ne bloque pas)
const optionalAuthMiddleware = (req, res, next) => {
	if (req.session.userId) {
		next();
	} else {
		next();
	}
};

module.exports = { 
	authMiddleware, 
	roleMiddleware,
	sessionKeyMiddleware,
	optionalAuthMiddleware 
};
