const express = require('express');
const router = express.Router();
const pagoCtrl = require('./pago.controller');

router.get('/montos-matricula', pagoCtrl.obtenerMontosMatricula);
router.get('/matricula/:matriculaId', pagoCtrl.obtenerPagosPorMatricula);
router.get('/matricula/info/:matriculaId', pagoCtrl.obtenerMatriculaInfo);

router.get('/mensualidades-pendientes', pagoCtrl.obtenerMensualidadesPendientes);

router.get('/mensualidades-registradas', pagoCtrl.obtenerMensualidadesRegistradas);

router.get('/todos', pagoCtrl.obtenerTodosPagos);

// crear pago
router.post('/crear', pagoCtrl.crearPago);

router.get('/incompletos', pagoCtrl.obtenerPagosIncompletos);

router.get('/incompletos/matrix', pagoCtrl.obtenerMontosIncompletosMatrix);

router.get('/incompletos/secuencia', pagoCtrl.obtenerSecuenciasIncompletas);

module.exports = router;