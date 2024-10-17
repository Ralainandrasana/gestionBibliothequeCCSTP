const router = require('express').Router();
const userController = require('../controllers/userController')

//CRUD table User
router.get('/allUser', userController.getAllUser) //Read
router.post('/addUser', userController.addNewUser) //Create
router.post('/updateUser', userController.updateAnUser) //Update
router.post('/deleteUser', userController.deleteAnUser) //Delete

module.exports = router


