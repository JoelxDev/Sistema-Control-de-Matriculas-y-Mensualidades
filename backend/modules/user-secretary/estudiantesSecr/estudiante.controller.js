// ===========================================
//  FUNCION PARA EL MODULO ESTUDIANTES  
// ===========================================
const Estudiante = require("./estudiante.model");

exports.listarEstudiantes = async (req, res) => {
    try {
        const rows = await Estudiante.listarEstudiantes();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.detalleEstudiante = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Estudiante.detalleEstudiante(id);
        
        if (!data) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};