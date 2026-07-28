const router = require('express').Router();
const livreController = require('../controllers/livreController')
const adherentController = require('../controllers/adherentController')
const personneController = require('../controllers/personneController')
const livreEmpruntController = require('../controllers/livreEmpruntController')

//inofo sur l'effectif des livres et celles des adherents
router.get('/effectifTotalAdherent', adherentController.getEffectifAdherent) //Read
router.get('/effectifAdherentParCategorie', adherentController.getEffectifParCategorieAdherent) //Read
router.get('/effectifTotalLivre', livreController.getEffectifLivre) //Read
router.get('/effectifLivreParType', livreController.getEffectifParTypelivre) //Read
router.get('/effectifLivreParDewey', livreController.getEffectifParDeweylivre) //Read
router.get('/livresNonDispo', livreController.getAllLivresNonDispo) //Read
router.get('/autoCompletePersonnes', personneController.getAutoCompletePersonnes) //Read
router.get('/matricule', personneController.getMatricule) //Read
router.get('/autoCompleteAdherents', adherentController.getAutoCompleteAdherents) //Read
router.get('/empruntInvalide', adherentController.getEmpruntInvalide) //Read
router.get('/classementAdherents', adherentController.getClassementAdherents) //Read
router.get('/evolutionInscription', adherentController.getEvolutionInscription) //Read
router.get('/classementLivres', livreController.getClassementLivres) //Read
router.get('/autoCompleteLivres', livreController.getAutoCompleteLivres) //Read 
router.get('/adherent/search/:id_adh', adherentController.searchAdherant) //read

router.put('/livre_emprunts/renouveler/:id', livreEmpruntController.renouvelerLivreEmprunt) //Put
router.put('/livre_emprunts/rendre/:id', livreEmpruntController.rendreLivreEmprunt) //Put
router.put('/livre/rendre/:id_livre', livreController.setDisponibleRendu) //Put
router.put('/adherent/rendre/:id_adh', adherentController.decrementNbrLivreEmp) //Put
router.put('/adherent/avertir/:id_adh', adherentController.avertirAdherant) //Put


module.exports = router
