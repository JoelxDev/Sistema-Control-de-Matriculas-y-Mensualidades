const express = require('express');
const router = express.Router();
const controllerDeudores = require('./deudores.controller');
// ...existing code...
router.get('/meses', controllerDeudores.listarMeses);
router.get('/pendientes', controllerDeudores.listarDeudoresHastaMesActual);
// router.get('/seccion/:id', controllerDeudores.listarPagosPorSeccion);


module.exports = router;
// ...existing code...