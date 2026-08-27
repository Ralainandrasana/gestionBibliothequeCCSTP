const router = require('express').Router();
const userController = require('../controllers/userController')
const deweyController = require('../controllers/deweyController')
const adherentController = require('../controllers/adherentController')
const livreController = require('../controllers/livreController')
const oeuvreController = require('../controllers/oeuvreController')
const personneController = require('../controllers/personneController')
const livreEmpruntController = require('../controllers/livreEmpruntController')
const appLogsController = require('../controllers/appLogsController')
const upload = require('../config/upload');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { ROLES, STAFF_ROLES, ALL_ROLES } = require('../config/accessControl');

router.use(authMiddleware);

//CRUD table User
router.get('/users', roleMiddleware(STAFF_ROLES), userController.getAllUser) //Read
router.get('/users/:id', roleMiddleware(STAFF_ROLES), userController.getUserById) // Read one
router.post('/register', roleMiddleware([ROLES.ADMIN]), upload.single('photo'), userController.addNewUser) //Create
router.put('/users', roleMiddleware([ROLES.ADMIN]), upload.single('photo'), userController.updateAnUser) //Update
router.delete('/users/:id', roleMiddleware([ROLES.ADMIN]), userController.deleteAnUser) //Delete

// CRUD table Dewey
router.get('/Deweys', roleMiddleware(STAFF_ROLES), deweyController.getAllDeweys); // Read
router.post('/Deweys', roleMiddleware(STAFF_ROLES), deweyController.addNewDewey); // Create
router.put('/Deweys', roleMiddleware(STAFF_ROLES), deweyController.updateADewey); // Update
router.delete('/Deweys', roleMiddleware([ROLES.ADMIN]), deweyController.deleteADewey); // Delete

//adherents
router.get('/adherents', roleMiddleware(STAFF_ROLES), adherentController.getAllAdherents);
router.get('/adherents/attached-person-ids', roleMiddleware(STAFF_ROLES), adherentController.getAttachedPersonIds);
router.get('/adherents/:id_adh', roleMiddleware(STAFF_ROLES), adherentController.getAdherentById);
router.post('/adherents', roleMiddleware(STAFF_ROLES), upload.none(), adherentController.addNewAdherent);
router.put('/adherents', roleMiddleware(STAFF_ROLES), adherentController.updateAdherent);
router.delete('/adherents/:id_adh', roleMiddleware([ROLES.ADMIN]), adherentController.deleteAdherent);

// App Logs routes
router.get('/app_logs', roleMiddleware([ROLES.ADMIN]), appLogsController.getAllAppLogs);
router.post('/app_logs', roleMiddleware([ROLES.ADMIN]), appLogsController.addNewAppLog);
router.delete('/app_logs', roleMiddleware([ROLES.ADMIN]), appLogsController.deleteAppLog);

// Livre routes
router.get('/livres', roleMiddleware(ALL_ROLES), livreController.getAllLivres);
router.get('/livres/:id_livre', roleMiddleware(ALL_ROLES), livreController.getLivreById);
router.post('/livres', roleMiddleware(STAFF_ROLES), upload.none(), livreController.addNewLivre);
router.put('/livres', roleMiddleware(STAFF_ROLES), livreController.updateLivre);
router.delete('/livres', roleMiddleware([ROLES.ADMIN]), livreController.deleteLivre);

// Livre Emprunt routes
router.get('/livre_emprunts_recent', roleMiddleware(STAFF_ROLES), livreEmpruntController.getAllLivreEmpruntsRecent);
router.get('/livre_emprunts_non_rendu', roleMiddleware(STAFF_ROLES), livreEmpruntController.getAllLivreEmpruntsNonRendu);
router.get('/livre_emprunts_non_rendu/:id', roleMiddleware(STAFF_ROLES), livreEmpruntController.getLivreEmpruntNonRenduById);
router.post('/livre_emprunts', roleMiddleware(STAFF_ROLES), upload.none(),livreEmpruntController.addNewLivreEmprunt);
router.put('/livre_emprunts', roleMiddleware(STAFF_ROLES), livreEmpruntController.updateLivreEmprunt);
router.delete('/livre_emprunts/:id', roleMiddleware([ROLES.ADMIN]), livreEmpruntController.deleteLivreEmprunt);

// Oeuvre routes
router.get('/oeuvres', roleMiddleware(STAFF_ROLES), oeuvreController.getAllOeuvres);
router.post('/oeuvres', roleMiddleware(STAFF_ROLES), oeuvreController.addNewOeuvre);
router.put('/oeuvres', roleMiddleware(STAFF_ROLES), oeuvreController.updateOeuvre);
router.delete('/oeuvres', roleMiddleware([ROLES.ADMIN]), oeuvreController.deleteOeuvre);

// Personne routes
router.get('/personnes', roleMiddleware(STAFF_ROLES), personneController.getAllPersonnes);
router.get('/personnes/:id', roleMiddleware(STAFF_ROLES), personneController.getPersonneById);
router.post('/personnes', roleMiddleware(STAFF_ROLES), upload.single('photo'), personneController.addNewPersonne);
router.put('/personnes', roleMiddleware(STAFF_ROLES), upload.single('photo'), personneController.updatePersonne);
router.delete('/personnes/:id', roleMiddleware([ROLES.ADMIN]), personneController.deletePersonne);

module.exports = router


