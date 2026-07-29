// Middleware d'authentification de base
const authMiddleware = (req, res, next) => {
	if (!req.session.userId) {
		return res.status(401).json({
			success: false,
			message: 'Non authentifié'
		});
	}
	next();
};

// Middleware pour vérifier les rôles
const roleMiddleware = (roles) => {
	return (req, res, next) => {
		if (!req.session.userId) {
			return res.status(401).json({
				success: false,
				message: 'Non authentifié'
			});
		}
		
		// Vérifier si l'utilisateur a le rôle requis
		const userRoles = req.session.roles || 'user';
		const userRolesArray = userRoles.split(',').map(r => r.trim());
		
		const hasRole = roles.some(role => userRolesArray.includes(role));
		
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