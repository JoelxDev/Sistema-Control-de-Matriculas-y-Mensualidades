const express = require('express');
const router = express.Router();
const MatriculaWebController = require('./matriculasWeb.controller');

// Ruta pública para crear matrícula
router.post('/', MatriculaWebController.crear);

// Rutas protegidas para administradores
router.get('/', MatriculaWebController.listar);
router.get('/:id', MatriculaWebController.obtenerPorId);

module.exports = router;