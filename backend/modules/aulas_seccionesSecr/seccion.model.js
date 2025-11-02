const db = require("../../config/db");

const Seccion = {
  async crearSeccion({ nombre, grados_id_grado, aulas_id_aula }) {
    const [result] = await db.execute(
      "INSERT INTO secciones (nombre, grados_id_grado, aulas_id_aula) VALUES (?, ?, ?)",
      [nombre, grados_id_grado, aulas_id_aula]
    );
    return result.insertId;
  },

  async listarSecciones() {
    const [rows] = await db.execute(
      `SELECT s.*, g.nombre_grad, a.capacidad_maxima, a.estado AS estado_aula, n.nombre_niv,
              (SELECT COUNT(*) FROM matriculas m WHERE m.secciones_id_seccion = s.id_seccion) as total_estudiantes
       FROM secciones s
       JOIN grados g ON s.grados_id_grado = g.id_grado
       JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
       JOIN aulas a ON s.aulas_id_aula = a.id_aula`
    );
    
    // Calcular vacantes y estado para cada sección
    return rows.map(sec => ({
        ...sec,
        vacantes_disponibles: (sec.capacidad_maxima || 0) - (sec.total_estudiantes || 0),
        estado_aula: ((sec.capacidad_maxima || 0) - (sec.total_estudiantes || 0)) === 0 ? 'Completo' : 'Disponible'
    }));
},

  async obtenerSeccionPorId(id) {
    const [rows] = await db.execute(
      `SELECT s.*, g.nombre_grad, a.capacidad_maxima, a.estado AS estado_aula, n.nombre_niv AS nombre_nivel
       FROM secciones s
       JOIN grados g ON s.grados_id_grado = g.id_grado
       JOIN aulas a ON s.aulas_id_aula = a.id_aula
       JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
       WHERE s.id_seccion = ?`, [id]
    );
    return rows[0] || null;
  },

  async actualizarSeccion({ id_seccion, nombre, grados_id_grado, aulas_id_aula }) {
    const [result] = await db.execute(
      "UPDATE secciones SET nombre = ?, grados_id_grado = ?, aulas_id_aula = ? WHERE id_seccion = ?",
      [nombre, grados_id_grado, aulas_id_aula, id_seccion]
    );
    return result.affectedRows > 0;
  },

  async eliminarSeccion(id_seccion) {
    const [result] = await db.execute(
      "DELETE FROM secciones WHERE id_seccion = ?",
      [id_seccion]
    );
    return result.affectedRows > 0;
  },
  // En seccion.model.js
  async obtenerSeccionesPorGrado(gradoId) {
  const [rows] = await db.execute(
    'SELECT * FROM secciones WHERE grados_id_grado = ?',
    [gradoId]
  );
  return rows;
  },
  async obtenerEstudiantesPorSeccion(idSeccion) {
    const [rows] = await db.execute(`
      SELECT e.nombre_est, e.apellido_est, e.dni_est, e.estado_est, e.fecha_nacimiento_est, e.titular_est, e.discapacidad_est, e.detalles_disc_est
      FROM estudiantes e
      JOIN matriculas m ON m.estudiantes_id_estudiante = e.id_estudiante
      WHERE m.secciones_id_seccion = ?
    `, [idSeccion]);
    return rows;
  },
  async obtenerDatosSeccion(idSeccion) {
    const [rows] = await db.execute(`
        SELECT s.id_seccion, s.nombre as nombre_seccion, s.capacidad_maxima,
               a.estado as estado_aula,
               (SELECT COUNT(*) FROM matriculas m WHERE m.secciones_id_seccion = s.id_seccion) as total_estudiantes
        FROM secciones s
        LEFT JOIN aulas a ON s.aulas_id_aula = a.id_aula
        WHERE s.id_seccion = ?
        LIMIT 1
    `, [idSeccion]);
    return rows[0] || null;
}
};

module.exports = Seccion;