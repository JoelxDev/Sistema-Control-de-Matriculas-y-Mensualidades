const express = require('express');
const router = express.Router();
const periodoCtrl = require('./preriodo.controller');

router.post('/', periodoCtrl.crearPeriodo);
router.get('/', periodoCtrl.listarPeriodos);
router.get('/:id', periodoCtrl.obtenerPeriodoPorId);
router.put('/:id', periodoCtrl.editarPeriodo);
router.delete('/:id', periodoCtrl.eliminarPeriodo);

module.exports = router;