const livreModel = require("../models/livre");

class LivreController {
    // READ
    static async getAllLivres(req, res) {
        try {
            const results = await livreModel.getLivres();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Livres');
        }
    }

    // CREATE
    static async addNewLivre(req, res) {
        try {
            await livreModel.addLivre(req.body);
            res.send('Livre added successfully');
        } catch (error) {
            res.status(500).send('Error adding Livre');
        }
    }

    // UPDATE
    static async updateLivre(req, res) {
        try {
            await livreModel.updateLivre(req.body.id_livre, req.body);
            res.send('Livre updated successfully');
        } catch (error) {
            res.status(500).send('Error updating Livre');
        }
    }

    // DELETE
    static async deleteLivre(req, res) {
        try {
            await livreModel.deleteLivre(req.body.id_livre);
            res.send('Livre deleted successfully');
        } catch (error) {
            res.status(500).send('Error deleting Livre');
        }
    }
    // effectif total des livres
    static async getEffectifLivre(req, res){
        try {
            const results = await livreModel.getEffectifLivre();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Livres');
        }
    }
    // effectif par type des livres
    static async getEffectifParTypelivre(req, res){
        try {
            const results = await livreModel.getEffectifParTypelivre();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Livres');
        }
    }
    // effectif par Dewey des livres
    static async getEffectifParDeweylivre(req, res){
        try {
            const results = await livreModel.getEffectifParDeweylivre();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Livres');
        }
    }
}

module.exports = LivreController;
