const oeuvreModel = require("../models/oeuvre");

class OeuvreController {
    // READ
    static async getAllOeuvres(req, res) {
        try {
            const results = await oeuvreModel.getOeuvres();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Oeuvres');
        }
    }

    // CREATE
    static async addNewOeuvre(req, res) {
        try {
            await oeuvreModel.addOeuvre(req.body);
            res.send('Oeuvre added successfully');
        } catch (error) {
            res.status(500).send('Error adding Oeuvre');
        }
    }

    // UPDATE
    static async updateOeuvre(req, res) {
        try {
            await oeuvreModel.updateOeuvre(req.body.id, req.body);
            res.send('Oeuvre updated successfully');
        } catch (error) {
            res.status(500).send('Error updating Oeuvre');
        }
    }

    // DELETE
    static async deleteOeuvre(req, res) {
        try {
            await oeuvreModel.deleteOeuvre(req.body.id);
            res.send('Oeuvre deleted successfully');
        } catch (error) {
            res.status(500).send('Error deleting Oeuvre');
        }
    }
}

module.exports = OeuvreController;
