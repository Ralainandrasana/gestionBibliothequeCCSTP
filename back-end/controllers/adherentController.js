const adherentModel = require("../models/adherent");

class AdherentController {
    // READ
    static async getAllAdherents(req, res) {
        try {
            const results = await adherentModel.getAdherents();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Adherents');
        }
    }

    // CREATE
    static async addNewAdherent(req, res) {
        try {
            await adherentModel.addAdherent(req.body);
            res.send('Adherent added successfully');
        } catch (error) {
            res.status(500).send('Error adding Adherent');
        }
    }

    // UPDATE
    static async updateAdherent(req, res) {
        try {
            await adherentModel.updateAdherent(req.body.id_adh, req.body);
            res.send('Adherent updated successfully');
        } catch (error) {
            res.status(500).send('Error updating Adherent');
        }
    }

    // DELETE
    static async deleteAdherent(req, res) {
        try {
            const { id_adh } = req.params;
            await adherentModel.deleteAdherent(id_adh);
            res.send('Adherent deleted successfully');
        } catch (error) {
            res.status(500).send('Error deleting Adherent');
        }
    }
    // effectif total des adherents
    static async getEffectifAdherent(req, res) {
        try {
            const results = await adherentModel.getEffectifAdherent();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Adherents');
        }
    }
    // effectif par categorie des adherents
    static async getEffectifParCategorieAdherent(req, res) {
        try {
            const results = await adherentModel.getEffectifParCategorieAdherent();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Adherents');
        }
    }
}

module.exports = AdherentController;
