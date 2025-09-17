const express = require("express");
const router = express.Router();
const aulaCtrl = require("./aula.controller");

// CRUD PARA AULA
router.post("/", aulaCtrl.crearAula);
router.get("/", aulaCtrl.listarAulas);
router.get("/:id", aulaCtrl.obtenerAulaPorId);
router.put("/:id", aulaCtrl.actualizarAula);
router.delete("/:id", aulaCtrl.eliminarAula);

module.exports = router;