const livreEmpruntModel = require("../models/livreEmprunt");
const adherantModel = require("../models/adherent");
const livreModel = require("../models/livre");
const { getPagination, paginatedResponse } = require('../utils/pagination');

class LivreEmpruntController {
    // READ
    static async getAllLivreEmpruntsRecent(req, res) {
        try {
            const pagination = getPagination(req);
            const results = await livreEmpruntModel.getLivreEmpruntsRecent(pagination);
            res.json(pagination ? paginatedResponse(results, pagination) : results);
        } catch (error) {
            res.status(500).send('Error retrieving Livre Emprunts');
        }
    }

    static async getAllLivreEmpruntsNonRendu(req, res) {
        try {
            const pagination = getPagination(req);
            const results = await livreEmpruntModel.getLivreEmpruntsNonRendu(pagination);
            res.json(pagination ? paginatedResponse(results, pagination) : results);
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
            const result = await livreEmpruntModel.deleteLivreEmprunt(id);

            if (!result) {
                return res.status(404).json({ message: 'Emprunt introuvable.' });
            }

            res.json({
                message: result.estNonRendu
                    ? 'Emprunt supprimé, livre remis en disponibilité et compteur de l’adhérent mis à jour.'
                    : 'Emprunt supprimé avec succès.'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l’emprunt :', error);
            res.status(500).json({ message: 'Erreur lors de la suppression de l’emprunt.' });
        }
    }
}

module.exports = LivreEmpruntController;
