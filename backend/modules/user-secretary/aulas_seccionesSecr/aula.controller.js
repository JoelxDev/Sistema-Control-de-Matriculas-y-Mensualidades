const Aula = require("./aula.model");

// CRUD PARA AULA
exports.crearAula = async (req, res) => {
    try {
        const { capacidad_maxima, estado } = req.body;
        if (!capacidad_maxima || !estado) return res.status(400).json({ error: "Datos requeridos" });
        const id = await Aula.crearAula({ capacidad_maxima, estado });
        res.status(201).json({ message: "Aula creada", id });
    } catch (err) {
        res.status(500).json({ error: "Error al crear aula" });
    }
};

exports.listarAulas = async (req, res) => {
    try {
        const aulas = await Aula.listarAulas();
        res.json(aulas);
    } catch (err) {
        res.status(500).json({ error: "Error al listar aulas" });
    }
};

exports.obtenerAulaPorId = async (req, res) => {
    try {
        const aula = await Aula.obtenerAulaPorId(req.params.id);
        if (!aula) return res.status(404).json({ error: "Aula no encontrada" });
        res.json(aula);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener aula" });
    }
};

exports.actualizarAula = async (req, res) => {
    try {
        const { capacidad_maxima, estado } = req.body;
        const { id } = req.params;
        if (!capacidad_maxima || !estado) return res.status(400).json({ error: "Datos requeridos" });
        const ok = await Aula.actualizarAula({ id_aula: id, capacidad_maxima, estado });
        if (ok) res.json({ message: "Aula actualizada" });
        else res.status(404).json({ error: "Aula no encontrada" });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar aula" });
    }
};

exports.eliminarAula = async (req, res) => {
    try {
        const { id } = req.params;
        const ok = await Aula.eliminarAula(id);
        if (ok) res.json({ message: "Aula eliminada" });
        else res.status(404).json({ error: "Aula no encontrada" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar aula" });
    }
};