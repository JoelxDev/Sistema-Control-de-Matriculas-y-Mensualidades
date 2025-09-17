const express = require('express');
const router = express.Router();
const anioAcademicoController = require('./anioAcademico.controller')

router.post('/', anioAcademicoController.crearAnioAcademico);
router.get('/', anioAcademicoController.listarAnioAcademico);
router.get('/:id', anioAcademicoController.obtenerAnioAcademicoPorId);
router.put('/:id', anioAcademicoController.editarAnioAcademico);
router.delete('/:id', anioAcademicoController.eliminarAnioAcademico);

module.exports = router;