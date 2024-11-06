const personneModel = require("../models/personne");

class PersonneController {
    // READ
    static async getAllPersonnes(req, res) {
        try {
            const results = await personneModel.getPersonnes();
            res.json(results);
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
            await personneModel.updatePersonne(req.body.id, req.body);
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
