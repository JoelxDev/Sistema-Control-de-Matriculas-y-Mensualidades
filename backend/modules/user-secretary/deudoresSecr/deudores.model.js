// Ajusta el import del pool según tu proyecto
const pool = require('../../../config/db'); 

const ORDER_MES = `FIELD(UPPER(men.mes),
  'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
  'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE')`;
async function obtenerMeses() {
  const sql = `
    SELECT DISTINCT mes
    FROM mensualidades
    ORDER BY FIELD(UPPER(mes),
      'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
      'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE')
  `;
  const [rows] = await pool.query(sql);
  return rows.map(r => r.mes);
}
/**
 * Deudores (matrícula activa) hasta mes tope. Mantengo por si lo usas en otra vista.
 */
async function obtenerDeudoresHastaMesActual({ nivelId, gradoId, seccionId, incluirFuturos, hastaMes } = {}) {
  const mesTope = incluirFuturos ? 12 : (Number(hastaMes) || (new Date().getMonth() + 1));

  let sql = `
    SELECT
      e.id_estudiante,
      e.nombre_est,
      e.apellido_est,
      n.nombre_niv   AS nivel,
      g.nombre_grad  AS grado,
      s.nombre       AS seccion,
      m.id_matricula,
      GROUP_CONCAT(men.mes ORDER BY ${ORDER_MES}) AS meses_pendientes,
      COUNT(men.id_mes) AS cantidad_pendiente
    FROM matriculas m
      JOIN estudiantes e ON e.id_estudiante = m.estudiantes_id_estudiante
      JOIN secciones s   ON s.id_seccion = m.secciones_id_seccion
      JOIN grados g      ON g.id_grado = s.grados_id_grado
      JOIN niveles n     ON n.id_nivel = g.niveles_id_nivel
      LEFT JOIN mensualidades men
        ON men.matriculas_id_matricula = m.id_matricula
       AND ${ORDER_MES} BETWEEN 1 AND ?
      LEFT JOIN pagos p
        ON p.mensualidades_id_pago = men.id_mes
    WHERE m.estado_matr = 'activo'
      AND men.id_mes IS NOT NULL
      AND p.id_pagos IS NULL
  `;
  const params = [mesTope];
  if (nivelId)   { sql += ' AND n.id_nivel = ?';   params.push(nivelId); }
  if (gradoId)   { sql += ' AND g.id_grado = ?';   params.push(gradoId); }
  if (seccionId) { sql += ' AND s.id_seccion = ?'; params.push(seccionId); }

  sql += `
    GROUP BY m.id_matricula, e.id_estudiante, e.nombre_est, e.apellido_est,
             n.nombre_niv, g.nombre_grad, s.nombre
    ORDER BY e.apellido_est, e.nombre_est
  `;
  const [rows] = await pool.query(sql, params);
  return rows;
}


async function obtenerPagosPorSeccion(idSeccion, mesTope) {
  const sql = `
    SELECT
      e.id_estudiante,
      e.nombre_est,
      e.apellido_est,
      m.id_matricula,
      men.id_mes       AS mensualidad_id,
      men.mes,
      IF(p.id_pagos IS NULL, 0, 1) AS pagado,
      p.id_pagos,
      p.monto_pago,
      p.metodo_pago,
      p.comprobante_pago
    FROM matriculas m
      JOIN estudiantes e ON e.id_estudiante = m.estudiantes_id_estudiante
      JOIN secciones  s  ON s.id_seccion   = m.secciones_id_seccion
      LEFT JOIN mensualidades men
        ON men.matriculas_id_matricula = m.id_matricula
       AND ${ORDER_MES} BETWEEN 1 AND ?
      LEFT JOIN pagos p
        ON p.mensualidades_id_pago = men.id_mes
    WHERE s.id_seccion = ?
      AND m.estado_matr = 'activo'
      AND men.id_mes IS NOT NULL
    ORDER BY e.apellido_est, e.nombre_est, ${ORDER_MES}
  `;
  const [rows] = await pool.query(sql, [mesTope, idSeccion]);
  return rows;
}

module.exports = {
  // ...existing code...
  obtenerMeses,
  obtenerDeudoresHastaMesActual,
  obtenerPagosPorSeccion
};
// ...existing code...