const personneModel = require("../models/personne");
const { getPagination, paginatedResponse } = require('../utils/pagination');

class PersonneController {
    // READ
    static async getAllPersonnes(req, res) {
        try {
            const pagination = getPagination(req);
            const results = await personneModel.getPersonnes(pagination);
            res.json(pagination ? paginatedResponse(results, pagination) : results);
        } catch (error) {
            res.status(500).send('Error retrieving Personnes');
        }
    }

    // READ autocomplete
    static async getAutoCompletePersonnes(req, res) {
        try {
            const results = await personneModel.getAutoCompletePersonnes(req.query.search);
            console.log(req.query.search)
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Personnes');
        }
    }
    // READ autocomplete
    static async getMatricule(req, res) {
        try {
            const results = await personneModel.getMatricule();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Personnes');
        }
    }

    // CREATE
    static async addNewPersonne(req, res) {
        try {
            const { code, nom, prenom, date_nais, lieu, CIN, adresse, profession, departement, tel, date_inscription } = req.body; // Récupérer d'autres champs
            const photoUrl = `http://localhost/Bibliofianar/uploads/files/${req.file.filename}`; // Construire l'URL
    
            // Vous pouvez maintenant ajouter l'utilisateur à la base de données avec les données et l'URL de la photo
            await personneModel.addPersonne({  code, nom, prenom, date_nais, lieu, CIN, adresse, profession, departement, tel, date_inscription, photo: photoUrl });
            
            res.send('Personne ajoutée avec succès');
        } catch (error) {
            res.status(500).send('Erreur lors de l\'ajout de la personne');
            console.log(error);
        }
    }

    // UPDATE
    static async updatePersonne(req, res) {
        try {
            const uploadPublicUrl = (process.env.UPLOAD_PUBLIC_URL || 'http://localhost/Bibliofianar/uploads/files').replace(/\/$/, '');
            const photo = req.file
                ? `${uploadPublicUrl}/${req.file.filename}`
                : req.body.photo;

            await personneModel.updatePersonne(req.body.id, { ...req.body, photo });
            res.send('Personne updated successfully');
        } catch (error) {
            res.status(500).send('Error updating Personne');
        }
    }

    // DELETE
    static async deletePersonne(req, res) {
        try {
            const { id } = req.params;
            await personneModel.deletePersonne(id);
            res.send('Personne deleted successfully');
        } catch (error) {
            res.status(500).send('Error deleting Personne');
        }
    }
}

module.exports = PersonneController;
