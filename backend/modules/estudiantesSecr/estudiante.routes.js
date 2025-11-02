const express = require('express');
const router = express.Router();
const estudianteCtrl = require('./estudiante.controller');
// ENDPOINT PARA EL MODULO ESTUDIANTES
router.get('/', estudianteCtrl.listarEstudiantes);
router.get('/:id', estudianteCtrl.detalleEstudiante);

module.exports = router;