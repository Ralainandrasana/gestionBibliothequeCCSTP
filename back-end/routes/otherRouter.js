const router = require('express').Router();
const livreController = require('../controllers/livreController')
const adherentController = require('../controllers/adherentController')
const personneController = require('../controllers/personneController')
const livreEmpruntController = require('../controllers/livreEmpruntController')
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { ROLES, STAFF_ROLES, ALL_ROLES } = require('../config/accessControl');

router.use(authMiddleware);

//inofo sur l'effectif des livres et celles des adherents
router.get('/effectifTotalAdherent', roleMiddleware(ALL_ROLES), adherentController.getEffectifAdherent) //Read
router.get('/effectifAdherentParCategorie', roleMiddleware(ALL_ROLES), adherentController.getEffectifParCategorieAdherent) //Read
router.get('/effectifTotalLivre', roleMiddleware(ALL_ROLES), livreController.getEffectifLivre) //Read
router.get('/effectifLivreParType', roleMiddleware(ALL_ROLES), livreController.getEffectifParTypelivre) //Read
router.get('/effectifLivreParDewey', roleMiddleware(ALL_ROLES), livreController.getEffectifParDeweylivre) //Read
router.get('/evolutionInscription', roleMiddleware(ALL_ROLES), adherentController.getEvolutionInscription) //Read
router.get('/livresNonDispo', roleMiddleware(STAFF_ROLES), livreController.getAllLivresNonDispo) //Read
router.get('/autoCompletePersonnes', roleMiddleware(STAFF_ROLES), personneController.getAutoCompletePersonnes) //Read
router.get('/matricule', roleMiddleware(STAFF_ROLES), personneController.getMatricule) //Read
router.get('/autoCompleteAdherents', roleMiddleware(STAFF_ROLES), adherentController.getAutoCompleteAdherents) //Read
router.get('/empruntInvalide', roleMiddleware(STAFF_ROLES), adherentController.getEmpruntInvalide) //Read
router.get('/classementAdherents', roleMiddleware([ROLES.ADMIN]), adherentController.getClassementAdherents) //Read
router.get('/classementLivres', roleMiddleware([ROLES.ADMIN]), livreController.getClassementLivres) //Read
router.get('/autoCompleteLivres', roleMiddleware(STAFF_ROLES), livreController.getAutoCompleteLivres) //Read
router.get('/adherent/search/:id_adh', roleMiddleware(STAFF_ROLES), adherentController.searchAdherant) //read

router.put('/livre_emprunts/renouveler/:id', roleMiddleware(STAFF_ROLES), livreEmpruntController.renouvelerLivreEmprunt) //Put
router.put('/livre_emprunts/rendre/:id', roleMiddleware(STAFF_ROLES), livreEmpruntController.rendreLivreEmprunt) //Put
router.put('/livre/rendre/:id_livre', roleMiddleware(STAFF_ROLES), livreController.setDisponibleRendu) //Put
router.put('/adherent/rendre/:id_adh', roleMiddleware(STAFF_ROLES), adherentController.decrementNbrLivreEmp) //Put
router.put('/adherent/avertir/:id_adh', roleMiddleware(STAFF_ROLES), adherentController.avertirAdherant) //Put


module.exports = router
