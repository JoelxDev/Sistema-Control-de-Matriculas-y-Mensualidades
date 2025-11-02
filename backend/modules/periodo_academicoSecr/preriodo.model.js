const db = require("../../config/db");

const Periodo = {
  async crearPeriodo({ nombre_per, fecha_inicio_per, fecha_fin_per, estado_per, anio_academico_id_anio_escolar }) {
    const [result] = await db.execute(
      "INSERT INTO periodos (nombre_per, fecha_inicio_per, fecha_fin_per, estado_per, anio_academico_id_anio_escolar) VALUES (?, ?, ?, ?, ?)",
      [nombre_per, fecha_inicio_per, fecha_fin_per, estado_per, anio_academico_id_anio_escolar]
    );
    return { id: result.insertId };
  },

  async listarPeriodos() {
    const [rows] = await db.execute(
      `SELECT p.*, a.anio_acad 
       FROM periodos p 
       JOIN anio_academico a ON p.anio_academico_id_anio_escolar = a.id_anio_escolar`
    );
    return rows;
  },

  async obtenerPeriodoPorId(id) {
    const [rows] = await db.execute(
      `SELECT p.*, a.anio_acad 
       FROM periodos p 
       JOIN anio_academico a ON p.anio_academico_id_anio_escolar = a.id_anio_escolar
       WHERE p.id_periodo = ?`, [id]
    );
    return rows[0] || null;
  },

  async editarPeriodo({ id, nombre_per, fecha_inicio_per, fecha_fin_per, estado_per, anio_academico_id_anio_escolar }) {
    const [result] = await db.execute(
      "UPDATE periodos SET nombre_per = ?, fecha_inicio_per = ?, fecha_fin_per = ?, estado_per = ?, anio_academico_id_anio_escolar = ? WHERE id_periodo = ?",
      [nombre_per, fecha_inicio_per, fecha_fin_per, estado_per, anio_academico_id_anio_escolar, id]
    );
    return result.affectedRows > 0;
  },

  async eliminarPeriodo(id) {
    const [result] = await db.execute(
      "DELETE FROM periodos WHERE id_periodo = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Periodo;