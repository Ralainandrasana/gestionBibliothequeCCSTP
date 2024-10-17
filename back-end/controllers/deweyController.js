const deweyModel = require("../models/dewey");

class DeweyController {
    // READ
    static async getAllDeweys(req, res) {
        try {
            const results = await deweyModel.getDeweys();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Deweys');
        }
    }

    // CREATE
    static async addNewDewey(req, res) {
        const { titre, description } = req.body;

        try {
            await deweyModel.addDewey(titre, description);
            res.send('Dewey added successfully');
        } catch (error) {
            res.status(500).send('Error adding Dewey');
        }
    }

    // UPDATE
    static async updateADewey(req, res) {
        const { id, titre, description } = req.body;

        try {
            await deweyModel.updateDewey(id, titre, description);
            res.send('Dewey updated successfully');
        } catch (error) {
            res.status(500).send('Error updating Dewey');
        }
    }

    // DELETE
    static async deleteADewey(req, res) {
        const { id } = req.body;

        try {
            await deweyModel.deleteDewey(id);
            res.send('Dewey deleted successfully');
        } catch (error) {
            res.status(500).send('Error deleting Dewey');
        }
    }
}

module.exports = DeweyController;
