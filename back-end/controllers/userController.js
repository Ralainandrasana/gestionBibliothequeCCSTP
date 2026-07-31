const userModel = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ALL_ROLES, normalizeRole, ROLES } = require('../config/accessControl');

const validateRole = (role) => {
    const normalizedRole = normalizeRole(role);
    return ALL_ROLES.includes(normalizedRole) ? normalizedRole : null;
};

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCOUNT_STATUSES = ['active', 'pending', 'blocked'];
const USER_ROLE_IDS = [1, 2];

class UserController {
    // LIRE
    static async getAllUser(req, res) {
        try {
            const results = await userModel.getUsers();
            if (results) res.json(results);
            else res.status(404).json({ message: "Aucun utilisateur trouvé." });
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur.", error });
        }
    }

    // CRÉER
    static async addNewUser(req, res) {
        const { nom, pswd, email, roles, account_status, user_role_id } = req.body;
        
        try {
            const normalizedNom = String(nom || '').trim();
            const normalizedEmail = String(email || '').trim().toLowerCase();
            const normalizedStatus = String(account_status || '').trim().toLowerCase();
            const normalizedUserRoleId = Number(user_role_id);

            if (!normalizedNom || !pswd || !normalizedEmail || !req.file) {
                return res.status(400).json({
                    message: "Le nom, le mot de passe, l'email et la photo sont requis."
                });
            }

            if (!PASSWORD_PATTERN.test(pswd)) {
                return res.status(400).json({
                    message: 'Le mot de passe doit contenir au moins 6 caractères, une majuscule, un nombre et un symbole.'
                });
            }

            if (!EMAIL_PATTERN.test(normalizedEmail)) {
                return res.status(400).json({ message: 'Adresse email invalide.' });
            }

            // Vérifier si l'utilisateur existe déjà
            const userExists = await userModel.checkUserIfExist(normalizedNom);
            if (userExists) return res.status(409).json({ message: "L'utilisateur existe déjà." });

            const emailExists = await userModel.emailExists(normalizedEmail);
            if (emailExists) return res.status(409).json({ message: "L'adresse email existe déjà." });

            const normalizedRole = validateRole(roles);
            if (!normalizedRole) {
                return res.status(400).json({ message: "Rôle utilisateur invalide." });
            }

            if (!ACCOUNT_STATUSES.includes(normalizedStatus)) {
                return res.status(400).json({ message: "Statut du compte invalide." });
            }

            if (!USER_ROLE_IDS.includes(normalizedUserRoleId)) {
                return res.status(400).json({ message: "User Role Id invalide." });
            }

            const expectedUserRoleId = normalizedRole === ROLES.ADMIN ? 1 : 2;
            if (normalizedUserRoleId !== expectedUserRoleId) {
                return res.status(400).json({
                    message: `Le User Role Id attendu pour ce rôle est ${expectedUserRoleId}.`
                });
            }

            // Hachage du mot de passe
            const hashedPassword = await bcrypt.hash(pswd, 10);
            const uploadPublicUrl = (process.env.UPLOAD_PUBLIC_URL || 'http://localhost/Bibliofianar/uploads/files').replace(/\/$/, '');
            const photo = `${uploadPublicUrl}/${req.file.filename}`;
            const loginSessionKey = null;
            const emailStatus = 'pending';
            const passwordResetKey = null;

            // Ajout de l'utilisateur
            const userAdded = await userModel.addUser(
                normalizedNom,
                hashedPassword,
                normalizedEmail,
                photo,
                normalizedRole,
                loginSessionKey,
                emailStatus,
                passwordResetKey,
                normalizedStatus,
                normalizedUserRoleId
            );
            if (userAdded) res.status(201).json({ message: 'Utilisateur ajouté avec succès.', id: userAdded.insertId });
            else res.status(400).send('Erreur lors de l’ajout de l’utilisateur.');
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur.", error });
        }
    }

    // METTRE À JOUR
    static async updateAnUser(req, res) {
        const { id, nom, email, roles, account_status, user_role_id } = req.body;
        
        try {
            const currentUser = await userModel.getUserById(id);
            if (!currentUser) {
                return res.status(404).json({ message: "Utilisateur introuvable." });
            }

            const normalizedRole = validateRole(roles);
            if (!normalizedRole) {
                return res.status(400).json({ message: "Rôle utilisateur invalide." });
            }

            const normalizedStatus = String(account_status || '').trim().toLowerCase();
            if (!ACCOUNT_STATUSES.includes(normalizedStatus)) {
                return res.status(400).json({ message: "Statut du compte invalide." });
            }

            const normalizedUserRoleId = Number(user_role_id);
            const expectedUserRoleId = normalizedRole === ROLES.ADMIN ? 1 : 2;
            if (normalizedUserRoleId !== expectedUserRoleId) {
                return res.status(400).json({ message: `Le User Role Id attendu est ${expectedUserRoleId}.` });
            }

            const normalizedNom = String(nom || '').trim();
            const normalizedEmail = String(email || '').trim().toLowerCase();
            if (!normalizedNom || !EMAIL_PATTERN.test(normalizedEmail)) {
                return res.status(400).json({ message: "Nom ou adresse email invalide." });
            }

            if (normalizedNom !== currentUser.nom && await userModel.usernameExists(normalizedNom)) {
                return res.status(409).json({ message: "Ce nom d'utilisateur existe déjà." });
            }

            if (normalizedEmail !== currentUser.email && await userModel.emailExists(normalizedEmail)) {
                return res.status(409).json({ message: "Cette adresse email existe déjà." });
            }

            const uploadPublicUrl = (process.env.UPLOAD_PUBLIC_URL || 'http://localhost/Bibliofianar/uploads/files').replace(/\/$/, '');
            const photo = req.file
                ? `${uploadPublicUrl}/${req.file.filename}`
                : (req.body.photo || currentUser.photo);

            const userUpdated = await userModel.updateUserDetails(
                id,
                normalizedNom,
                normalizedEmail,
                photo,
                normalizedRole,
                normalizedStatus,
                normalizedUserRoleId
            );
            if (userUpdated.affectedRows) res.status(200).json({ message: 'Utilisateur mis à jour avec succès.' });
            else res.status(400).send('Erreur lors de la mise à jour de l’utilisateur.');
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur.", error });
        }
    }

    // SUPPRIMER
    static async deleteAnUser(req, res) {
        const { id } = req.params;

        try {
            if (Number(id) === Number(req.session.userId)) {
                return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
            }

            const userDeleted = await userModel.deleteUser(id);
            if (userDeleted) res.status(200).send('Utilisateur supprimé avec succès.');
            else res.status(400).send('Erreur lors de la suppression de l’utilisateur.');
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur.", error });
        }
    }
	static async login(req, res) {

		try {
            // Vérifier si l'utilisateur existe déjà
            const data = await userModel.getInfoUser(req.body.nom);
            if (data.length === 0) return res.status(404).json({ message: "L'utilisateur n'existe pas." });

            // check du mot de passe
            const checkPassword = bcrypt.compareSync(req.body.pswd, data[0].pswd)

            // si mdp est incorret
			if(!checkPassword) return res.status(400).json("wrong password or username") 
            
			//si tous se pass bien
			const {pswd, ...others} = data[0];

			const token = jwt.sign({ id: data[0].id }, "secretkey");
			res.cookie("accestoken", token, {
				httpOnly: true,
			})
			.status(200)
			.json(others);
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur.", error });
        }
    }
}

module.exports = UserController;
