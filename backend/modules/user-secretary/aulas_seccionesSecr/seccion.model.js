const db = require("../../../config/db");

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
      `SELECT s.*, g.nombre_grad, a.capacidad_maxima, a.estado AS estado_aula, n.nombre_niv 
       FROM secciones s
       JOIN grados g ON s.grados_id_grado = g.id_grado
       JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
       JOIN aulas a ON s.aulas_id_aula = a.id_aula`
    );
    return rows;
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
  }
};

module.exports = Seccion;