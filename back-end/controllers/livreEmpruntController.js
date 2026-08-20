const livreEmpruntModel = require("../models/livreEmprunt");
const adherantModel = require("../models/adherent");
const livreModel = require("../models/livre");
const { getPagination, paginatedResponse } = require('../utils/pagination');

function formatDateFr(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? null
        : new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' }).format(date);
}

function getRenewalRefusalMessages(result) {
    const messages = [];
    const emprunt = result.emprunt || {};

    for (const reason of result.reasons || []) {
        if (reason === 'DEJA_RENDU') messages.push('Cet emprunt a déjà été rendu.');
        if (reason === 'DEJA_RENOUVELE') messages.push('Cet emprunt a déjà été renouvelé une fois.');
        if (reason === 'ADHERENT_INTROUVABLE') messages.push("L'adhérent associé est introuvable.");
        if (reason === 'ADHERENT_SANCTIONNE') messages.push("Cet adhérent est sanctionné.");
        if (reason === 'ADHESION_EXPIREE') {
            const dateFin = formatDateFr(emprunt.date_fin);
            messages.push(dateFin
                ? `L'adhésion de cet adhérent a expiré le ${dateFin}.`
                : "L'adhésion de cet adhérent est expirée.");
        }
        if (reason === 'LIMITE_LIVRES_DEPASSEE') {
            messages.push(
                `Cet adhérent possède actuellement ${Number(emprunt.nbrLivreEmp) || 0} livres empruntés ; le renouvellement est refusé au-delà de 2.`
            );
        }
    }

    return messages;
}

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
            const result = await livreEmpruntModel.renouvelerLivreEmprunt(id);

            if (!result.found) {
                return res.status(404).json({ message: 'Emprunt introuvable.' });
            }

            if (!result.renewed) {
                const messages = getRenewalRefusalMessages(result);
                return res.status(409).json({
                    code: 'RENEWAL_REFUSED',
                    message: messages.join(' • '),
                    reasons: result.reasons
                });
            }

            res.json({
                message: 'Emprunt renouvelé avec succès.',
                date_emprunt: result.emprunt.date_emprunt,
                date_retour: result.emprunt.date_retour,
                renouvelable: Boolean(result.emprunt.renouvelable)
            });
        } catch (error) {
            console.error('Erreur lors du renouvellement :', error);
            res.status(500).json({ message: 'Erreur lors du renouvellement de l’emprunt.' });
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
