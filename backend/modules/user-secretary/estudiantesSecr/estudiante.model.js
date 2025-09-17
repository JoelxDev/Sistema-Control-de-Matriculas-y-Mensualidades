const db = require("../../../config/db");

const Estudiante = {
async listarEstudiantes() {
    const [rows] = await db.execute(`
        SELECT 
            e.id_estudiante, 
            e.nombre_est, 
            e.apellido_est, 
            e.dni_est, 
            m.fecha_matricula, 
            s.nombre as seccion, 
            p.nombre_per as periodo, 
            m.estado_matr, 
            d.nombre_desc as descuento, 
            e.titular_est
        FROM estudiantes e
        JOIN matriculas m ON m.estudiantes_id_estudiante = e.id_estudiante
        JOIN secciones s ON s.id_seccion = m.secciones_id_seccion
        JOIN periodos p ON p.id_periodo = m.periodos_id_periodo
        LEFT JOIN descuentos d ON d.id_descuento = e.descuentos_id_descuento
        ORDER BY m.fecha_matricula DESC
    `);
    return rows;
},

async detalleEstudiante(id) {
    // Datos del estudiante
    const [estudiante] = await db.execute(`SELECT * FROM estudiantes WHERE id_estudiante = ?`, [id]);
    
    if (!estudiante[0]) return null;
    
    // Responsables del estudiante
    const [responsables] = await db.execute(`
        SELECT r.*, er.tipo_vinculo 
        FROM responsable_legal r
        JOIN estudiantes_responsable er ON r.id_responsable_legal = er.responsable_legal_id_responsable_legal
        WHERE er.estudiantes_id_estudiante = ?
    `, [id]);
    
    return { 
        estudiante: estudiante[0], 
        responsables 
    };
},
};

module.exports = Estudiante