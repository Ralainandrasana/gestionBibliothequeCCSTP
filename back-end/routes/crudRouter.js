const router = require('express').Router();
const userController = require('../controllers/userController')
const deweyController = require('../controllers/deweyController')
const adherentController = require('../controllers/adherentController')
const livreController = require('../controllers/livreController')
const oeuvreController = require('../controllers/oeuvreController')
const personneController = require('../controllers/personneController')
const livreEmpruntController = require('../controllers/livreEmpruntController')
const appLogsController = require('../controllers/appLogsController')

//CRUD table User
router.get('/allUser', userController.getAllUser) //Read
router.post('/addUser', userController.addNewUser) //Create
router.post('/updateUser', userController.updateAnUser) //Update
router.post('/deleteUser', userController.deleteAnUser) //Delete

// CRUD table Dewey
router.get('/allDeweys', deweyController.getAllDeweys); // Read
router.post('/addDewey', deweyController.addNewDewey); // Create
router.post('/updateDewey', deweyController.updateADewey); // Update
router.post('/deleteDewey', deweyController.deleteADewey); // Delete

router.get('/adherents', adherentController.getAllAdherents);
router.post('/adherents', adherentController.addNewAdherent);
router.put('/adherents', adherentController.updateAdherent);
router.delete('/adherents', adherentController.deleteAdherent);

// App Logs routes
router.get('/app_logs', appLogsController.getAllAppLogs);
router.post('/app_logs', appLogsController.addNewAppLog);
router.delete('/app_logs', appLogsController.deleteAppLog);

// Livre routes
router.get('/livres', livreController.getAllLivres);
router.post('/livres', livreController.addNewLivre);
router.put('/livres', livreController.updateLivre);
router.delete('/livres', livreController.deleteLivre);

// Livre Emprunt routes
router.get('/livre_emprunts', livreEmpruntController.getAllLivreEmprunts);
router.post('/livre_emprunts', livreEmpruntController.addNewLivreEmprunt);
router.put('/livre_emprunts', livreEmpruntController.updateLivreEmprunt);
router.delete('/livre_emprunts', livreEmpruntController.deleteLivreEmprunt);

// Oeuvre routes
router.get('/oeuvres', oeuvreController.getAllOeuvres);
router.post('/oeuvres', oeuvreController.addNewOeuvre);
router.put('/oeuvres', oeuvreController.updateOeuvre);
router.delete('/oeuvres', oeuvreController.deleteOeuvre);

// Personne routes
router.get('/personnes', personneController.getAllPersonnes);
router.post('/personnes', personneController.addNewPersonne);
router.put('/personnes', personneController.updatePersonne);
router.delete('/personnes', personneController.deletePersonne);

module.exports = router


