const MensualidadModel = require('./mensua.model');

class MensuaController {
    // Crear nueva mensualidad
    static async crearMensualidad(req, res) {
        try {
            const { mes, fecha_limite, descripcion_mes } = req.body;

            // Validaciones
            if (!mes || !fecha_limite) {
                return res.status(400).json({
                    success: false,
                    message: 'Mes y fecha límite son campos obligatorios'
                });
            }

            // Validar fecha límite
            const fechaLimite = parseInt(fecha_limite);
            if (isNaN(fechaLimite) || fechaLimite < 1 || fechaLimite > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha límite debe ser un número entre 1 y 30'
                });
            }

            // Verificar si el mes ya existe
            const mesExiste = await MensualidadModel.existeMes(mes);
            if (mesExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'Este mes ya está registrado'
                });
            }

            // Crear mensualidad
            const resultado = await MensualidadModel.crear({
                mes: mes.toLowerCase(),
                fecha_limite: fechaLimite,
                descripcion_mes: descripcion_mes || null
            });

            res.status(201).json({
                success: true,
                message: 'Mensualidad creada exitosamente',
                data: {
                    id_mes: resultado.insertId,
                    mes,
                    fecha_limite: fechaLimite,
                    descripcion_mes
                }
            });

        } catch (error) {
            console.error('Error al crear mensualidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener todas las mensualidades
    static async obtenerMensualidades(req, res) {
        try {
            const mensualidades = await MensualidadModel.obtenerTodas();
            
            res.status(200).json({
                success: true,
                message: 'Mensualidades obtenidas exitosamente',
                data: mensualidades
            });

        } catch (error) {
            console.error('Error al obtener mensualidades:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener mensualidad por ID
    static async obtenerMensualidadPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            const mensualidad = await MensualidadModel.obtenerPorId(id);

            if (!mensualidad) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensualidad no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Mensualidad obtenida exitosamente',
                data: mensualidad
            });

        } catch (error) {
            console.error('Error al obtener mensualidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar mensualidad
    static async actualizarMensualidad(req, res) {
        try {
            const { id } = req.params;
            const { mes, fecha_limite, descripcion_mes } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            // Verificar si existe la mensualidad
            const mensualidadExiste = await MensualidadModel.obtenerPorId(id);
            if (!mensualidadExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensualidad no encontrada'
                });
            }

            // Validaciones
            if (!mes || !fecha_limite) {
                return res.status(400).json({
                    success: false,
                    message: 'Mes y fecha límite son campos obligatorios'
                });
            }

            // Validar fecha límite
            const fechaLimite = parseInt(fecha_limite);
            if (isNaN(fechaLimite) || fechaLimite < 1 || fechaLimite > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha límite debe ser un número entre 1 y 30'
                });
            }

            // Verificar si el mes ya existe (excluyendo el actual)
            const mesExiste = await MensualidadModel.existeMes(mes, id);
            if (mesExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'Este mes ya está registrado'
                });
            }

            // Actualizar mensualidad
            await MensualidadModel.actualizar(id, {
                mes: mes.toLowerCase(),
                fecha_limite: fechaLimite,
                descripcion_mes: descripcion_mes || null
            });

            res.status(200).json({
                success: true,
                message: 'Mensualidad actualizada exitosamente',
                data: {
                    id_mes: id,
                    mes,
                    fecha_limite: fechaLimite,
                    descripcion_mes
                }
            });

        } catch (error) {
            console.error('Error al actualizar mensualidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Eliminar mensualidad
    static async eliminarMensualidad(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            // Verificar si existe la mensualidad
            const mensualidadExiste = await MensualidadModel.obtenerPorId(id);
            if (!mensualidadExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensualidad no encontrada'
                });
            }

            // Eliminar mensualidad
            await MensualidadModel.eliminar(id);

            res.status(200).json({
                success: true,
                message: 'Mensualidad eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar mensualidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    static async listarMeses(req, res) {
        try {
            const meses = await MensualidadModel.obtenerMeses();
            res.json({ meses });
        } catch (err) {
            console.error('listarMeses:', err);
            res.status(500).json({ error: 'Error interno' });
        }
    }

    static async listarPagosPorSeccion(req, res) {
        try {
            const idSeccion = Number(req.params.id);
            if (!idSeccion) return res.status(400).json({ error: 'id de sección inválido' });

            const incluirFuturos = req.query.incluirFuturos === '1' || req.query.incluirFuturos === 'true';
            const hastaMes = Number(req.query.hastaMes);
            const mesTope = incluirFuturos ? 12 : (hastaMes || (new Date().getMonth() + 1));

            const rows = await MensualidadModel.obtenerPagosPorSeccion(idSeccion, mesTope);
            res.json({ rows });
        } catch (err) {
            console.error('listarPagosPorSeccion:', err);
            res.status(500).json({ error: 'Error interno' });
        }
    }
}

module.exports = MensuaController;