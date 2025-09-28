const express = require('express');
const router = express.Router();
const pagoCtrl = require('./pago.controller');

router.get('/montos-matricula', pagoCtrl.obtenerMontosMatricula);
router.get('/matricula/:matriculaId', pagoCtrl.obtenerPagosPorMatricula);
router.get('/matricula/info/:matriculaId', pagoCtrl.obtenerMatriculaInfo);

// crear pago
router.post('/crear', pagoCtrl.crearPago);

module.exports = router;