const router = require('express').Router();
const livreController = require('../controllers/livreController')
const adherentController = require('../controllers/adherentController')
const personneController = require('../controllers/personneController')

//inofo sur l'effectif des livres et celles des adherents
router.get('/effectifTotalAdherent', adherentController.getEffectifAdherent) //Read
router.get('/effectifAdherentParCategorie', adherentController.getEffectifParCategorieAdherent) //Read
router.get('/effectifTotalLivre', livreController.getEffectifLivre) //Read
router.get('/effectifLivreParType', livreController.getEffectifParTypelivre) //Read
router.get('/effectifLivreParDewey', livreController.getEffectifParDeweylivre) //Read
router.get('/autoCompletePersonnes', personneController.getAutoCompletePersonnes) //Read

module.exports = router 
