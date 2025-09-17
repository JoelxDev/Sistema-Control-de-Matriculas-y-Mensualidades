const db = require("../../../config/db");
// CRUD PARA NIVEL
const Nivel = {
  async crearNivel({ nombre_niv }) {
    const [result] = await db.execute(
      "INSERT INTO niveles (nombre_niv) VALUES (?)",
      [nombre_niv]
    );
    return result.insertId;
  },

  async listarNiveles() {
    const [rows] = await db.execute("SELECT * FROM niveles");
    return rows;
  },

  async obtenerNivelPorId(id) {
    const [rows] = await db.execute("SELECT * FROM niveles WHERE id_nivel = ?", [id]);
    return rows[0] || null;
  },

  async actualizarNivel({ id_nivel, nombre_niv }) {
    const [result] = await db.execute(
      "UPDATE niveles SET nombre_niv = ? WHERE id_nivel = ?",
      [nombre_niv, id_nivel]
    );
    return result.affectedRows > 0;
  },

  async eliminarNivel(id_nivel) {
    const [result] = await db.execute(
      "DELETE FROM niveles WHERE id_nivel = ?",
      [id_nivel]
    );
    return result.affectedRows > 0;
  }
};
// CRUD PARA GRADO
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
module.exports = Nivel;