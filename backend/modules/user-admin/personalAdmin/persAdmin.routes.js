const express = require('express');
const router = express.Router();
const persAdminController = require('./persAdmin.controller');

router.post('/usuarios', persAdminController.registrarUsuario);
// router.get('/usuarios', persAdminController.registrarUsuario);


module.exports = router;