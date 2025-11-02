const gradoModel = require("./grado.model");
// CRUD PARA GRADO
exports.crearGrado = async (req, res) => {
  try {
    const { nombre_grad, niveles_id_nivel } = req.body;
    if (!nombre_grad || !niveles_id_nivel) return res.status(400).json({ error: "Datos requeridos" });
    const id = await gradoModel.crearGrado({ nombre_grad, niveles_id_nivel });
    res.status(201).json({ message: "Grado creado", id });
  } catch (err) {
    res.status(500).json({ error: "Error al crear grado" });
  }
};

exports.listarGrados = async (req, res) => {
  try {
    const grados = await gradoModel.listarGrados();
    res.json(grados);
  } catch (err) {
    res.status(500).json({ error: "Error al listar grados" });
  }
};

exports.obtenerGradoPorId = async (req, res) => {
  try {
    const grado = await gradoModel.obtenerGradoPorId(req.params.id);
    if (!grado) return res.status(404).json({ error: "Grado no encontrado" });
    res.json(grado);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener grado" });
  }
};

exports.actualizarGrado = async (req, res) => {
  try {
    const { nombre_grad, niveles_id_nivel } = req.body;
    const { id } = req.params;
    if (!nombre_grad || !niveles_id_nivel) return res.status(400).json({ error: "Datos requeridos" });
    const ok = await gradoModel.actualizarGrado({ id_grado: id, nombre_grad, niveles_id_nivel });
    if (ok) res.json({ message: "Grado actualizado" });
    else res.status(404).json({ error: "Grado no encontrado" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar grado" });
  }
};

exports.eliminarGrado = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await gradoModel.eliminarGrado(id);
    if (ok) res.json({ message: "Grado eliminado" });
    else res.status(404).json({ error: "Grado no encontrado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar grado" });
  }
};