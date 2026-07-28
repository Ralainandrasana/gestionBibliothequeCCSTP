const livreEmpruntModel = require("../models/livreEmprunt");
const adherantModel = require("../models/adherent");
const livreModel = require("../models/livre");

class LivreEmpruntController {
    // READ
    static async getAllLivreEmpruntsRecent(req, res) {
        try {
            const results = await livreEmpruntModel.getLivreEmpruntsRecent();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Livre Emprunts');
        }
    }

    static async getAllLivreEmpruntsNonRendu(req, res) {
        try {
            const results = await livreEmpruntModel.getLivreEmpruntsNonRendu();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving Livre Emprunts');
        }
    }

    // CREATE
    static async addNewLivreEmprunt(req, res) {
        try {
            const { code_pers, id_livre } = req.body;
            await livreEmpruntModel.addLivreEmprunt(req.body);
            await livreModel.setDisponible(id_livre);
            await adherantModel.incrementNbrLivreEmp(code_pers);
            res.send('Livre Emprunt added successfully');
        } catch (error) {
            res.status(500).send('Error adding Livre Emprunt');
        }
    }

    // UPDATE
    static async updateLivreEmprunt(req, res) {
        try {
            await livreEmpruntModel.updateLivreEmprunt(req.body.id, req.body);
            res.send('Livre Emprunt updated successfully');
        } catch (error) {
            res.status(500).send('Error updating Livre Emprunt');
        }
    }

    // UPDATE
    static async renouvelerLivreEmprunt(req, res) {
        try {
            const { id } = req.params;
            await livreEmpruntModel.renouvelerLivreEmprunt(id);
            res.send('Livre Emprunt updated successfully');
        } catch (error) {
            res.status(500).send('Error updating Livre Emprunt');
        }
    }

    // UPDATE
    static async rendreLivreEmprunt(req, res) {
        try {
            const { id } = req.params;
            await livreEmpruntModel.rendreLivreEmprunt(id);
            res.send('Livre Emprunt updated successfully');
        } catch (error) {
            console.log(error)
            res.status(500).send('Error updating Livre Emprunt');
        }
    }

    // DELETE
    static async deleteLivreEmprunt(req, res) {
        try {
            const { id } = req.params;
            await livreEmpruntModel.deleteLivreEmprunt(id);
            res.send('Livre Emprunt deleted successfully');
        } catch (error) {
            res.status(500).send('Error deleting Livre Emprunt');
        }
    }
}

module.exports = LivreEmpruntController;
