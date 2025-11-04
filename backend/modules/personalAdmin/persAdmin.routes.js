const express = require('express');
const router = express.Router();
const Controller = require('./persAdmin.controller');

// Listar todos (GET /api/admin/usuarios/personal)
router.get('/personal', Controller.listPersonal);

// Crear personal + usuario (POST /api/admin/usuarios/usuarios)
router.post('/usuarios', Controller.createPersonal);

// Obtener personal por personalId (GET /api/admin/usuarios/personal/:id)
router.get('/personal/:id', Controller.getPersonalById);

// Actualizar por usuarioId (PUT /api/admin/usuarios/usuarios-personal/:id)
router.put('/usuarios-personal/:id', Controller.updateByUsuarioId);

// Eliminar por personalId (DELETE /api/admin/usuarios/usuarios-personal/:id)
router.delete('/usuarios-personal/:id', Controller.deleteByPersonalId);

module.exports = router;