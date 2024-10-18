const userModel = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        const { 
            nom, 
            pswd, 
            email, 
            photo, 
            roles, 
            login_session_key, 
            email_status, 
            password_reset_key, 
            account_status, 
            user_role_id 
        } = req.body;
        
        try {
            // Vérifier si l'utilisateur existe déjà
            const userExists = await userModel.checkUserIfExist(nom);
            if (userExists) return res.status(409).json({ message: "L'utilisateur existe déjà." });

            // Hachage du mot de passe
            const hashedPassword = await bcrypt.hash(pswd, 10);

            // Ajout de l'utilisateur
            const userAdded = await userModel.addUser(nom, hashedPassword, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id);
            if (userAdded) res.status(201).send('Utilisateur ajouté avec succès.');
            else res.status(400).send('Erreur lors de l’ajout de l’utilisateur.');
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur.", error });
        }
    }

    // METTRE À JOUR
    static async updateAnUser(req, res) {
        const { 
            id, 
            nom, 
            pswd, 
            email, 
            photo, 
            roles, 
            login_session_key, 
            email_status, 
            password_reset_key, 
            account_status, 
            user_role_id 
        } = req.body;
        
        try {
            // Hachage du mot de passe si fourni
            let hashedPassword = pswd;
            if (pswd) {
                hashedPassword = await bcrypt.hash(pswd, 10);
            }

            // Mise à jour de l'utilisateur
            const userUpdated = await userModel.updateUser(id, nom, hashedPassword, email, photo, roles, login_session_key, email_status, password_reset_key, account_status, user_role_id);
            if (userUpdated) res.status(200).send('Utilisateur mis à jour avec succès.');
            else res.status(400).send('Erreur lors de la mise à jour de l’utilisateur.');
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur.", error });
        }
    }

    // SUPPRIMER
    static async deleteAnUser(req, res) {
        const { id } = req.body;

        try {
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
