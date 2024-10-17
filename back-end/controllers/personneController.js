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

    // CREATE
    static async addNewPersonne(req, res) {
        try {
            await personneModel.addPersonne(req.body);
            res.send('Personne added successfully');
        } catch (error) {
            res.status(500).send('Error adding Personne');
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
            await personneModel.deletePersonne(req.body.id);
            res.send('Personne deleted successfully');
        } catch (error) {
            res.status(500).send('Error deleting Personne');
        }
    }
}

module.exports = PersonneController;
