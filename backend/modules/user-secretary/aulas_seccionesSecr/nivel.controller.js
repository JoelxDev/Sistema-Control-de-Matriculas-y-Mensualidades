const nivelModel = require("./nivel.model");
// CRUD PARA NIVEL
exports.crearNivel = async (req, res) => {
  try {
    const { nombre_niv } = req.body;
    if (!nombre_niv) return res.status(400).json({ error: "Nombre requerido" });
    const id = await nivelModel.crearNivel({ nombre_niv });
    res.status(201).json({ message: "Nivel creado", id });
  } catch (err) {
    res.status(500).json({ error: "Error al crear nivel" });
  }
};

exports.listarNiveles = async (req, res) => {
  try {
    const niveles = await nivelModel.listarNiveles();
    res.json(niveles);
  } catch (err) {
    res.status(500).json({ error: "Error al listar niveles" });
  }
};

exports.obtenerNivelPorId = async (req, res) => {
  try {
    const nivel = await nivelModel.obtenerNivelPorId(req.params.id);
    if (!nivel) return res.status(404).json({ error: "Nivel no encontrado" });
    res.json(nivel);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener nivel" });
  }
};

exports.actualizarNivel = async (req, res) => {
  try {
    const { nombre_niv } = req.body;
    const { id } = req.params;
    if (!nombre_niv) return res.status(400).json({ error: "Nombre requerido" });
    const ok = await nivelModel.actualizarNivel({ id_nivel: id, nombre_niv });
    if (ok) res.json({ message: "Nivel actualizado" });
    else res.status(404).json({ error: "Nivel no encontrado" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar nivel" });
  }
};

exports.eliminarNivel = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await nivelModel.eliminarNivel(id);
    if (ok) res.json({ message: "Nivel eliminado" });
    else res.status(404).json({ error: "Nivel no encontrado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar nivel" });
  }
};
