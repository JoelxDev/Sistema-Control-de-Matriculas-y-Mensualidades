const Seccion = require("./seccion.model");

exports.crearSeccion = async (req, res) => {
  try {
    const { nombre, grados_id_grado, aulas_id_aula } = req.body;
    if (!nombre || !grados_id_grado || !aulas_id_aula) return res.status(400).json({ error: "Datos requeridos" });
    const id = await Seccion.crearSeccion({ nombre, grados_id_grado, aulas_id_aula });
    res.status(201).json({ message: "Sección creada", id });
  } catch (err) {
    res.status(500).json({ error: "Error al crear sección" });
  }
};

exports.listarSecciones = async (req, res) => {
  try {
    const { grado } = req.query;
    let secciones;
    if (grado) {
      secciones = await Seccion.obtenerSeccionesPorGrado(grado);
    } else {
      secciones = await Seccion.listarSecciones();
    }
    res.json(secciones);
  } catch (err) {
    res.status(500).json({ error: "Error al listar secciones" });
  }
};

exports.obtenerSeccionPorId = async (req, res) => {
  try {
    const seccion = await Seccion.obtenerSeccionPorId(req.params.id);
    if (!seccion) return res.status(404).json({ error: "Sección no encontrada" });
    res.json(seccion);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener sección" });
  }
};

exports.actualizarSeccion = async (req, res) => {
  try {
    const { nombre, grados_id_grado, aulas_id_aula } = req.body;
    const { id } = req.params;
    if (!nombre || !grados_id_grado || !aulas_id_aula) return res.status(400).json({ error: "Datos requeridos" });
    const ok = await Seccion.actualizarSeccion({ id_seccion: id, nombre, grados_id_grado, aulas_id_aula });
    if (ok) res.json({ message: "Sección actualizada" });
    else res.status(404).json({ error: "Sección no encontrada" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar sección" });
  }
};

exports.eliminarSeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await Seccion.eliminarSeccion(id);
    if (ok) res.json({ message: "Sección eliminada" });
    else res.status(404).json({ error: "Sección no encontrada" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar sección" });
  }
};

