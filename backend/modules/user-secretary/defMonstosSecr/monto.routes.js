const express = require('express');
const router = express.Router();
const montoCtrl = require('./monto.controller');

// Listar todos los montos o por tipo
router.get('/', montoCtrl.listarMontos);

// Obtener monto por tipo y grado
router.get('/:tipo/:gradoId', montoCtrl.obtenerMontoPorTipoYGrado);

// Crear monto
router.post('/', montoCtrl.crearMonto);
router.get('/:id', montoCtrl.obtenerMontoPorId);
// Actualizar monto
router.put('/:id', montoCtrl.actualizarMonto);

// Eliminar monto
router.delete('/:id', montoCtrl.eliminarMonto);

module.exports = router;