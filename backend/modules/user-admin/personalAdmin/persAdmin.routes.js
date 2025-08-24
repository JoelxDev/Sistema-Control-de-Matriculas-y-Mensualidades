const express = require('express');
const router = express.Router();
const persAdminController = require('./persAdmin.controller');

router.post('/usuarios', persAdminController.registrarUsuario);
// Mostrar personal + usuario 
router.get('/personal', persAdminController.mostrarPersonal)
router.get('/personal/:id', persAdminController.mostrarPersonalPorId)
router.delete('/usuarios-personal/:id', persAdminController.eliminarUsuarioYPersonal);
router.put('/usuarios-personal/:id', persAdminController.actualizarUsuarioYPersonal);

module.exports = router;