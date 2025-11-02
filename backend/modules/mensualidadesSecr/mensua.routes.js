const express = require('express');
const router = express.Router();
const mensuaController = require('./mensua.controller');
// const mensuaControllerPagos = require('../deudoresSecr/deudores.controller');

router.get('/meses', mensuaController.listarMeses);
router.get('/seccion/:id', mensuaController.listarPagosPorSeccion);

// Rutas para CRUD de mensualidades
router.post('/', mensuaController.crearMensualidad);
router.get('/', mensuaController.obtenerMensualidades);
router.get('/:id', mensuaController.obtenerMensualidadPorId);
router.put('/:id', mensuaController.actualizarMensualidad);
router.delete('/:id', mensuaController.eliminarMensualidad);
router.get('/seccion/:id/pdf', mensuaController.descargarPdfPorSeccion);


module.exports = router;