const adherentModel = require('../models/adherent');
const livreModel = require('../models/livre');

const CACHE_DURATION_MS = 30 * 1000;
let cachedSummary = null;
let cacheExpiresAt = 0;
let pendingSummary = null;

async function loadDashboardSummary() {
    const [
        livreTotalRows,
        adherentTotalRows,
        livresParType,
        adherentsParCategorie,
        evolutionInscription
    ] = await Promise.all([
        livreModel.getEffectifLivre(),
        adherentModel.getEffectifAdherent(),
        livreModel.getEffectifParTypelivre(),
        adherentModel.getEffectifParCategorieAdherent(),
        adherentModel.getEvolutionInscription()
    ]);

    return {
        effectifLivre: Number(livreTotalRows[0]?.effectifLivre || 0),
        effectifAdherent: Number(adherentTotalRows[0]?.effectifAdherent || 0),
        livresParType: livresParType.map((item) => ({
            ...item,
            effectif: Number(item.effectif || 0)
        })),
        adherentsParCategorie: adherentsParCategorie.map((item) => ({
            ...item,
            effectif: Number(item.effectif || 0)
        })),
        evolutionInscription: evolutionInscription.map((item) => ({
            ...item,
            effectifIns: Number(item.effectifIns || 0)
        }))
    };
}

class DashboardController {
    static async getSummary(req, res) {
        try {
            res.set('Cache-Control', 'private, max-age=30');
            if (cachedSummary && Date.now() < cacheExpiresAt) {
                res.set('X-Dashboard-Cache', 'HIT');
                return res.json(cachedSummary);
            }

            if (!pendingSummary) {
                pendingSummary = loadDashboardSummary()
                    .then((summary) => {
                        cachedSummary = summary;
                        cacheExpiresAt = Date.now() + CACHE_DURATION_MS;
                        return summary;
                    })
                    .finally(() => {
                        pendingSummary = null;
                    });
            }

            const summary = await pendingSummary;
            res.set('X-Dashboard-Cache', 'MISS');
            return res.json(summary);
        } catch (error) {
            console.error('Erreur lors du chargement du dashboard :', error);
            return res.status(500).json({ message: 'Impossible de charger le tableau de bord.' });
        }
    }
}

module.exports = DashboardController;
