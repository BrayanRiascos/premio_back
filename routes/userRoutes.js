const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/leerganadores', userController.leerganadores);
router.post('/login', userController.postLogin);
router.post('/crear', userController.crearusuario);
router.patch('/:regcodigo/:userid', userController.registrarcodigo);
router.get('/leercodigos/:userid', userController.leercodigos);





module.exports = router;

