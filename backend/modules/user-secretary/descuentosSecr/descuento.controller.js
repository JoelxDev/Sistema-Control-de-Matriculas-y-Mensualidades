const DescuentoModel = require("./descuento.model");

exports.crearDescuento = async (req, res) => {
  try {
    const { nombre_desc, porcentaje_desc, fecha_limite, descripcion_desc } = req.body;
    const nuevoDescuento = await DescuentoModel.crearDescuento({ nombre_desc, porcentaje_desc, fecha_limite, descripcion_desc });
    res.status(201).json(nuevoDescuento);
  } catch (error) {
    console.error("Error al crear descuento:", error);
    res.status(500).json({ error: "Error al crear descuento" });
  }
};
exports.listarDescuentos = async (req, res) => {
  try {
    const descuentos = await DescuentoModel.listarDescuentos();
    res.status(200).json(descuentos);
  } catch (error) {
    console.error("Error al listar descuentos:", error);
    res.status(500).json({ error: "Error al listar descuentos" });
  }
};
exports.obtenerDescuentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const descuento = await DescuentoModel.obtenerDescuentoPorId(id);
    if (descuento) {
      res.status(200).json(descuento);
    } else {
      res.status(404).json({ error: "Descuento no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener descuento por ID:", error);
    res.status(500).json({ error: "Error al obtener descuento por ID" });
  }
};
exports.editarDescuento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_desc, porcentaje_desc, fecha_limite, descripcion_desc } = req.body;
    const actualizado = await DescuentoModel.editarDescuento({ id, nombre_desc, porcentaje_desc, fecha_limite, descripcion_desc });
    if (actualizado) {
      res.status(200).json({ message: "Descuento actualizado" });
    } else {
      res.status(404).json({ error: "Descuento no encontrado" });
    }
  } catch (error) {
    console.error("Error al editar descuento:", error);
    res.status(500).json({ error: "Error al editar descuento" });
  }
};
exports.eliminarDescuento = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await DescuentoModel.eliminarDescuento(id);
    if (eliminado) {
      res.status(200).json({ message: "Descuento eliminado" });
    } else {
      res.status(404).json({ error: "Descuento no encontrado" });
    }
  } catch (error) {
    console.error("Error al eliminar descuento:", error);
    res.status(500).json({ error: "Error al eliminar descuento" });
  }
};