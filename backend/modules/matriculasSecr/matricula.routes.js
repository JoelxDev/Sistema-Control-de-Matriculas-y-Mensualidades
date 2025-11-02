const express = require('express');
const router = express.Router();
const matriculaCtrl = require('./matricula.controller');

router.post('/', matriculaCtrl.registrarMatriculaCompleta);
router.get('/', matriculaCtrl.listarMatriculas);
router.get('/:id', matriculaCtrl.obtenerMatriculaPorId);
router.put('/:id', matriculaCtrl.actualizarMatricula);
// ENDPOINT PARA EL MODULO ESTUDIANTES

module.exports = router;