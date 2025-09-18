const Monto = require('./monto.model');

exports.listarMontos = async (req, res) => {
    try {
        const tipo = req.query.tipo;
        let montos;
        if (tipo) {
            montos = await Monto.listarPorTipo(tipo);
        } else {
            montos = await Monto.listarTodos();
        }
        res.json(montos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerMontoPorTipoYGrado = async (req, res) => {
    try {
        const tipo = req.params.tipo;
        const gradoId = req.params.gradoId;
        const monto = await Monto.obtenerPorTipoYGrado(tipo, gradoId);
        if (!monto) {
            return res.status(404).json({ error: 'Monto no encontrado para ese tipo y grado' });
        }
        res.json(monto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerMontoPorId = async (req, res) => {
    try {
        const id = req.params.id;
        const monto = await Monto.obtenerPorId(id);
        if (!monto) {
            return res.status(404).json({ error: 'Monto no encontrado' });
        }
        res.json(monto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearMonto = async (req, res) => {
    try {
        const result = await Monto.crear(req.body);
        res.status(201).json({ id: result.insertId, message: 'Monto creado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.actualizarMonto = async (req, res) => {
    try {
        const id = req.params.id;
        const actualizado = await Monto.actualizar(id, req.body);
        if (!actualizado) {
            return res.status(404).json({ error: 'Monto no encontrado' });
        }
        res.json({ message: 'Monto actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.eliminarMonto = async (req, res) => {
    try {
        const id = req.params.id;
        const eliminado = await Monto.eliminar(id);
        if (!eliminado) {
            return res.status(404).json({ error: 'Monto no encontrado' });
        }
        res.json({ message: 'Monto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};