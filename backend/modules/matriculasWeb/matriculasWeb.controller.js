const MatriculaWebModel = require('./matriculasWeb.model');

class MatriculaWebController {
    static async crear(req, res) {
        try {
            const {
                nombre_estudiante,
                apellido_estudiante,
                dni_estudiante,
                fecha_nacimiento,
                genero,
                nombre_padre,
                dni_padre,
                nombre_madre,
                dni_madre,
                ubicacion,
                nivel,
                grado
            } = req.body;

            // Validaciones
            if (!nombre_estudiante || !apellido_estudiante || !dni_estudiante || !fecha_nacimiento || !genero || !nivel || !grado) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos obligatorios deben ser completados'
                });
            }

            // Validar DNI (8 dígitos)
            if (!/^\d{8}$/.test(dni_estudiante)) {
                return res.status(400).json({
                    success: false,
                    message: 'El DNI del estudiante debe tener 8 dígitos'
                });
            }

            // Verificar si el DNI ya existe
            const dniExiste = await MatriculaWebModel.verificarDniExistente(dni_estudiante);
            if (dniExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'El DNI del estudiante ya está registrado'
                });
            }

            // Validar DNI del padre (si se proporciona)
            if (dni_padre && !/^\d{8}$/.test(dni_padre)) {
                return res.status(400).json({
                    success: false,
                    message: 'El DNI del padre debe tener 8 dígitos'
                });
            }

            // Validar DNI de la madre (si se proporciona)
            if (dni_madre && !/^\d{8}$/.test(dni_madre)) {
                return res.status(400).json({
                    success: false,
                    message: 'El DNI de la madre debe tener 8 dígitos'
                });
            }

            // Crear matrícula
            const resultado = await MatriculaWebModel.crear(req.body);

            res.status(201).json({
                success: true,
                message: 'Matrícula registrada exitosamente. Nos contactaremos pronto.',
                data: {
                    id: resultado.insertId
                }
            });

        } catch (error) {
            console.error('Error al crear matrícula web:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async listar(req, res) {
        try {
            const matriculas = await MatriculaWebModel.obtenerTodas();
            
            res.status(200).json({
                success: true,
                data: matriculas
            });

        } catch (error) {
            console.error('Error al listar matrículas web:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const matricula = await MatriculaWebModel.obtenerPorId(id);

            if (!matricula) {
                return res.status(404).json({
                    success: false,
                    message: 'Matrícula no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                data: matricula
            });

        } catch (error) {
            console.error('Error al obtener matrícula web:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = MatriculaWebController;