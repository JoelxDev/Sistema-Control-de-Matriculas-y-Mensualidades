const express = require("express");
const router = express.Router();
const seccionCtrl = require("./seccion.controller");

router.post("/", seccionCtrl.crearSeccion);
router.get("/", seccionCtrl.listarSecciones);
router.get("/:id", seccionCtrl.obtenerSeccionPorId);
router.put("/:id", seccionCtrl.actualizarSeccion);
router.delete("/:id", seccionCtrl.eliminarSeccion);
router.get('/:id/estudiantes', seccionCtrl.listarEstudiantesPorSeccion);
router.get('/:id/datos', seccionCtrl.obtenerDatosSeccion);
module.exports = router;