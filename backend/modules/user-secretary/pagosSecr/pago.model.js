const db = require("../../../config/db");

const Pago = {
  async crearPago(datos) {
    const [result] = await db.execute(
      `INSERT INTO pagos 
        (tipo_pago, monto_pago, metodo_pago, descripcion, comprobante_pag, fecha_pago, mensualidades_id_pago, matriculas_id_matricula, usuarios_id_usuarios, estimar_monto_id_estimar_monto)
       VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [
        datos.tipo_pago || null,
        datos.monto || 0,
        datos.metodo_pago || null,
        datos.descripcion || null,
        datos.comprobante || null,
        datos.mensualidades_id_pago || null,
        datos.matriculas_id_matricula || null,
        datos.usuarios_id_usuarios || null,
        datos.estimar_monto_id_estimar_monto || null,
      ]
    );
    return result.insertId;
  },

  async obtenerPagosPorMatricula(matriculaId) {
    const [rows] = await db.execute(
      `SELECT * FROM pagos WHERE matriculas_id_matricula = ? ORDER BY fecha_pago DESC`,
      [matriculaId]
    );
    return rows;
  },

  async obtenerPagosPorEstudiante(estudianteId) {
    const [rows] = await db.execute(
      `SELECT p.* 
         FROM pagos p
         JOIN matriculas m ON p.matriculas_id_matricula = m.id_matricula
        WHERE m.estudiantes_id_estudiante = ?
        ORDER BY p.fecha_pago DESC`,
      [estudianteId]
    );
    return rows;
  },

  async obtenerMontosMatricula(nivelId = null, gradoId = null) {
    // 1) Si hay monto específico por grado, devolverlo
    if (gradoId) {
      const [porGrado] = await db.execute(
        `SELECT em.id_estimar_monto, em.monto_base, em.descripcion, em.grados_id_grado, g.nombre_grad
         FROM estimar_monto em
         LEFT JOIN grados g ON em.grados_id_grado = g.id_grado
         WHERE em.tipo_est_mon = 'matricula' AND em.grados_id_grado = ?`,
        [gradoId]
      );
      if (porGrado.length > 0) return porGrado;
      // si no hay resultados para el grado, caemos a filtro por nivel/general
    }

    // 2) Si hay nivel, devolver montos del nivel + montos generales (grados_id_grado IS NULL)
    const params = [];
    let where = `WHERE em.tipo_est_mon = 'matricula'`;
    if (nivelId) {
      where += ` AND (g.niveles_id_nivel = ? OR em.grados_id_grado IS NULL)`;
      params.push(nivelId);
    }

    const query = `
      SELECT em.id_estimar_monto, em.monto_base, em.descripcion, em.grados_id_grado, g.nombre_grad, g.niveles_id_nivel
      FROM estimar_monto em
      LEFT JOIN grados g ON em.grados_id_grado = g.id_grado
      ${where}
      ORDER BY g.nombre_grad IS NULL, g.nombre_grad, em.monto_base
    `;
    const [rows] = await db.execute(query, params);
    return rows;
  },

  // obtiene la matrícula por id (incluye campo estudiantes_id_estudiante)
  async obtenerMatriculaById(matriculaId) {
    const [rows] = await db.execute(
      `SELECT id_matricula, estudiantes_id_estudiante, estado_matr FROM matriculas WHERE id_matricula = ? LIMIT 1`,
      [matriculaId]
    );
    return rows.length ? rows[0] : null;
  },

  async actualizarMatriculaEstado(matriculaId, estado) {
    const [result] = await db.execute(
      `UPDATE matriculas SET estado_matr = ? WHERE id_matricula = ?`,
      [estado, matriculaId]
    );
    return result.affectedRows;
  },

  async eliminarPagoById(pagoId) {
    const [result] = await db.execute(
      `DELETE FROM pagos WHERE id_pagos = ?`,
      [pagoId]
    );
    return result.affectedRows;
  },

// obtiene detalle de la matrícula incluyendo sección, grado y nivel
  async obtenerMatriculaDetalle(matriculaId) {
    const [rows] = await db.execute(
      `SELECT 
         m.id_matricula, m.estado_matr, m.estudiantes_id_estudiante,
         m.secciones_id_seccion,
         s.nombre AS nombre_seccion,
         g.id_grado, g.nombre_grad, g.niveles_id_nivel,
         n.id_nivel, n.nombre_niv
       FROM matriculas m
       LEFT JOIN secciones s ON m.secciones_id_seccion = s.id_seccion
       LEFT JOIN grados g ON s.grados_id_grado = g.id_grado
       LEFT JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
       WHERE m.id_matricula = ? LIMIT 1`,
      [matriculaId]
    );
    return rows.length ? rows[0] : null;
  },

  async obtenerDescuentoPorEstudiante(estudianteId) {
    const [rows] = await db.execute(
      `SELECT d.id_descuento, d.porcentaje_desc
         FROM estudiantes e
         LEFT JOIN descuentos d ON e.descuentos_id_descuento = d.id_descuento
        WHERE e.id_estudiante = ? LIMIT 1`,
      [estudianteId]
    );
    return rows.length ? rows[0] : null;
  },
  async existePagoMensualidad(mensualidadesId, matriculaId, monthNum, yearNum) {
      const [rows] = await db.execute(
        `SELECT 1 FROM pagos
           WHERE tipo_pago = 'Mensualidad'
             AND mensualidades_id_pago = ?
             AND matriculas_id_matricula = ?
             AND MONTH(fecha_pago) = ?
             AND YEAR(fecha_pago) = ?
           LIMIT 1`,
        [mensualidadesId, matriculaId, monthNum, yearNum]
      );
      return rows.length > 0;
    },
};

module.exports = Pago;