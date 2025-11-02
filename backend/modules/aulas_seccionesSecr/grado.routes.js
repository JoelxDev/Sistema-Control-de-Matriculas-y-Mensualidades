const express = require("express");
const router = express.Router();
const gradoCtrl = require("./grado.controller");
// CRUD PARA GRADO
router.post("/", gradoCtrl.crearGrado);
router.get("/", gradoCtrl.listarGrados);
router.get("/:id", gradoCtrl.obtenerGradoPorId);
router.put("/:id", gradoCtrl.actualizarGrado);
router.delete("/:id", gradoCtrl.eliminarGrado);
module.exports = router;