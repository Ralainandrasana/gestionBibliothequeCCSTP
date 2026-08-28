const livreEmpruntModel = require("../models/livreEmprunt");
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { parseBulkIds } = require('../utils/bulkIds');

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
    static async getLivreEmpruntNonRenduById(req, res) {
        try {
            const result = await livreEmpruntModel.getLivreEmpruntNonRenduById(req.params.id);
            if (!result) return res.status(404).json({ message: 'Emprunt non rendu introuvable.' });
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors du chargement de l'emprunt." });
        }
    }

    static async addNewLivreEmprunt(req, res) {
        try {
            const result = await livreEmpruntModel.addLivreEmprunt(req.body);
            if (!result.added) {
                const messages = {
                    LIVRE_INTROUVABLE: 'Le livre sélectionné est introuvable.',
                    LIVRE_INDISPONIBLE: 'Ce livre est déjà emprunté et n’est plus disponible.',
                    ADHERENT_INTROUVABLE: "L’adhérent sélectionné est introuvable.",
                    ADHERENT_SANCTIONNE: "Cet adhérent est sanctionné et ne peut pas effectuer d’emprunt.",
                    ADHESION_EXPIREE: "L’adhésion de cet adhérent est expirée.",
                    LIMITE_LIVRES_ATTEINTE: `Cet adhérent a atteint la limite de 2 livres empruntés simultanément (${result.nbrLivreEmp || 0} actuellement).`
                };
                const status = result.reason?.endsWith('INTROUVABLE') ? 404 : 409;
                return res.status(status).json({
                    code: result.reason,
                    message: messages[result.reason] || "L’emprunt ne peut pas être enregistré.",
                    date_fin: result.date_fin || null
                });
            }
            res.status(201).json({ message: 'Emprunt ajouté avec succès.', id: result.insertId });
        } catch (error) {
            console.error('Erreur lors de l’ajout de l’emprunt :', error);
            res.status(500).json({ message: "Erreur lors de l’ajout de l’emprunt." });
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
                date_emprunt_initiale: result.emprunt.date_emprunt_initiale,
                date_emprunt: result.emprunt.date_emprunt,
                date_retour: result.emprunt.date_retour,
                renouvelable: Boolean(result.emprunt.renouvelable),
                retour_en_retard: result.retourEnRetard
            });
        } catch (error) {
            console.error('Erreur lors du renouvellement :', error);
            res.status(500).json({ message: 'Erreur lors du renouvellement de l’emprunt.' });
        }
    }

    static async rendreLivreEmprunt(req, res) {
        try {
            const result = await livreEmpruntModel.rendreLivreEmprunt(req.params.id);

            if (!result.found) {
                return res.status(404).json({ message: 'Cet emprunt est introuvable.' });
            }

            if (!result.returned) {
                return res.status(409).json({ message: 'Cet emprunt a déjà été rendu.' });
            }

            res.json({
                message: 'Retour du livre enregistré avec succès.',
                retour_en_retard: result.retourEnRetard,
                penaliser: result.penaliser,
                sanctionner: result.sanctionner
            });
        } catch (error) {
            console.error('Erreur lors du retour du livre :', error);
            res.status(500).json({ message: "Erreur lors de l’enregistrement du retour." });
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

    static async deleteLivreEmprunts(req, res) {
        try {
            const ids = parseBulkIds(req.body.ids);
            if (ids.length === 0) {
                return res.status(400).json({ message: 'Aucun emprunt valide sélectionné.' });
            }
            const result = await livreEmpruntModel.deleteLivreEmprunts(ids);
            res.json({
                message: `${result.deleted} emprunt(s) supprimé(s).`,
                deleted: result.deleted,
                restoredBooks: result.restoredBooks
            });
        } catch (error) {
            console.error('Erreur lors de la suppression multiple des emprunts :', error);
            res.status(500).json({ message: 'Impossible de supprimer les emprunts sélectionnés.' });
        }
    }
}

module.exports = LivreEmpruntController;
