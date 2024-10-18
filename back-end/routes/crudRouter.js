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
router.get('/users', userController.getAllUser) //Read
router.post('/register', userController.addNewUser) //Create
router.put('/users', userController.updateAnUser) //Update
router.delete('/users', userController.deleteAnUser) //Delete

//login and logout
router.post('/login', userController.login) //Create
router.post('/logout', userController.addNewUser) //Create

// CRUD table Dewey
router.get('/Deweys', deweyController.getAllDeweys); // Read
router.post('/Deweys', deweyController.addNewDewey); // Create
router.put('/Deweys', deweyController.updateADewey); // Update
router.delete('/Deweys', deweyController.deleteADewey); // Delete

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


