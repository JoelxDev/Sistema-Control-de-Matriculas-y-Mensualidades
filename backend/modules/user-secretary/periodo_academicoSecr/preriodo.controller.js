const PeriodoModel = require("./preriodo.model");

exports.crearPeriodo = async (req, res) => {
  try {
    const { nombre_per, fecha_inicio_per, fecha_fin_per, estado_per, anio_academico_id_anio_escolar } = req.body;
    if (!nombre_per || !fecha_inicio_per || !fecha_fin_per || !estado_per || !anio_academico_id_anio_escolar) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    const periodo = await PeriodoModel.crearPeriodo({ nombre_per, fecha_inicio_per, fecha_fin_per, estado_per, anio_academico_id_anio_escolar });
    res.status(201).json(periodo);
  } catch (err) {
    res.status(500).json({ error: "Error al crear periodo" });
  }
};

exports.listarPeriodos = async (req, res) => {
  try {
    const periodos = await PeriodoModel.listarPeriodos();
    res.json(periodos);
  } catch (err) {
    res.status(500).json({ error: "Error al listar periodos" });
  }
};

exports.obtenerPeriodoPorId = async (req, res) => {
  try {
    const periodo = await PeriodoModel.obtenerPeriodoPorId(req.params.id);
    if (!periodo) return res.status(404).json({ error: "Periodo no encontrado" });
    res.json(periodo);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener periodo" });
  }
};

exports.editarPeriodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_per, fecha_inicio_per, fecha_fin_per, estado_per, anio_academico_id_anio_escolar } = req.body;
    if (!nombre_per || !fecha_inicio_per || !fecha_fin_per || !estado_per || !anio_academico_id_anio_escolar) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    const ok = await PeriodoModel.editarPeriodo({ id, nombre_per, fecha_inicio_per, fecha_fin_per, estado_per, anio_academico_id_anio_escolar });
    if (ok) res.json({ message: "Periodo actualizado" });
    else res.status(404).json({ error: "Periodo no encontrado" });
  } catch (err) {
    res.status(500).json({ error: "Error al editar periodo" });
  }
};

exports.eliminarPeriodo = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await PeriodoModel.eliminarPeriodo(id);
    if (ok) res.json({ message: "Periodo eliminado" });
    else res.status(404).json({ error: "Periodo no encontrado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar periodo" });
  }
};