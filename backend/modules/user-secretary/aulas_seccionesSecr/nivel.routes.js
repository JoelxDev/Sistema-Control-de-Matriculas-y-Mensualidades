const express = require("express");
const router = express.Router();
const nivelCtrl = require("./nivel.controller");
// CRUD PARA NIVEL
router.post("/", nivelCtrl.crearNivel);
router.get("/", nivelCtrl.listarNiveles);
router.get("/:id", nivelCtrl.obtenerNivelPorId);
router.put("/:id", nivelCtrl.actualizarNivel);
router.delete("/:id", nivelCtrl.eliminarNivel);

module.exports = router;