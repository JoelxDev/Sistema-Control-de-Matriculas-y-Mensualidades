const db = require("../../config/db");

const Grado = {
  async crearGrado({ nombre_grad, niveles_id_nivel }) {
    const [result] = await db.execute(
      "INSERT INTO grados (nombre_grad, niveles_id_nivel) VALUES (?, ?)",
      [nombre_grad, niveles_id_nivel]
    );
    return result.insertId;
  },

  async listarGrados() {
    const [rows] = await db.execute(
      `SELECT g.*, n.nombre_niv 
       FROM grados g 
       JOIN niveles n ON g.niveles_id_nivel = n.id_nivel`
    );
    return rows;
  },

  async obtenerGradoPorId(id) {
    const [rows] = await db.execute(
      `SELECT g.*, n.nombre_niv 
       FROM grados g 
       JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
       WHERE g.id_grado = ?`, [id]
    );
    return rows[0] || null;
  },

  async actualizarGrado({ id_grado, nombre_grad, niveles_id_nivel }) {
    const [result] = await db.execute(
      "UPDATE grados SET nombre_grad = ?, niveles_id_nivel = ? WHERE id_grado = ?",
      [nombre_grad, niveles_id_nivel, id_grado]
    );
    return result.affectedRows > 0;
  },

  async eliminarGrado(id_grado) {
    const [result] = await db.execute(
      "DELETE FROM grados WHERE id_grado = ?",
      [id_grado]
    );
    return result.affectedRows > 0;
  }
};
module.exports = Grado;