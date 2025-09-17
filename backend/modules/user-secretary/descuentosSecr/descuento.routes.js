const express = require('express');
const router = express.Router();
const descuentoCtrl = require('./descuento.controller');

router.post('/', descuentoCtrl.crearDescuento);
router.get('/', descuentoCtrl.listarDescuentos);
router.get('/:id', descuentoCtrl.obtenerDescuentoPorId);
router.put('/:id', descuentoCtrl.editarDescuento);
router.delete('/:id', descuentoCtrl.eliminarDescuento);

module.exports = router;
