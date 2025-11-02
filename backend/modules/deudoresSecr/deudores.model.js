// Ajusta el import del pool según tu proyecto
const pool = require('../../config/db'); 

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

  // Traigo todas las mensualidades hasta mesTope y los pagos (si los hay) vinculados a cada matrícula
  let sql = `
    SELECT
      e.id_estudiante,
      e.nombre_est,
      e.apellido_est,
      n.id_nivel,
      n.nombre_niv   AS nivel,
      g.id_grado,
      g.nombre_grad  AS grado,
      s.id_seccion,
      s.nombre       AS seccion,
      m.id_matricula,
      men.id_mes,
      men.mes,
      men.fecha_limite,
      p.id_pagos,
      p.fecha_pago
    FROM matriculas m
      JOIN estudiantes e ON e.id_estudiante = m.estudiantes_id_estudiante
      JOIN secciones s   ON s.id_seccion = m.secciones_id_seccion
      JOIN grados g      ON g.id_grado = s.grados_id_grado
      JOIN niveles n     ON n.id_nivel = g.niveles_id_nivel

      -- mensualidades listadas por mes (hasta mesTope)
      LEFT JOIN mensualidades men
        ON FIELD(UPPER(men.mes),
          'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
          'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE') BETWEEN 1 AND ?
      -- pagos relacionan mensualidad con matrícula
      LEFT JOIN pagos p
        ON p.mensualidades_id_pago = men.id_mes
       AND p.matriculas_id_matricula = m.id_matricula

    WHERE m.estado_matr = 'activo'
      AND men.id_mes IS NOT NULL
  `;
  const params = [mesTope];
  if (nivelId)   { sql += ' AND n.id_nivel = ?';   params.push(nivelId); }
  if (gradoId)   { sql += ' AND g.id_grado = ?';   params.push(gradoId); }
  if (seccionId) { sql += ' AND s.id_seccion = ?'; params.push(seccionId); }

  sql += `
    ORDER BY m.id_matricula, FIELD(UPPER(men.mes),
      'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
      'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE')
  `;

  const [rows] = await pool.query(sql, params);

  // Agrupar por matrícula y construir estructura:
  const map = new Map();
  rows.forEach(r => {
    const key = r.id_matricula;
    if (!map.has(key)) {
      map.set(key, {
        id_matricula: r.id_matricula,
        id_estudiante: r.id_estudiante,
        nombre_est: r.nombre_est,
        apellido_est: r.apellido_est,
        nivel: r.nivel,
        grado: r.grado,
        seccion: r.seccion,
        mensualidades: []
      });
    }
    const entry = map.get(key);
    entry.mensualidades.push({
      id_mes: r.id_mes,
      mes: r.mes,
      pagado: !!r.id_pagos,
      fecha_pago: r.fecha_pago ? (new Date(r.fecha_pago)).toISOString().slice(0,10) : null
    });
  });

  // Calcular cantidad_pendiente por matrícula y devolver array
  const result = Array.from(map.values()).map(item => {
    item.cantidad_pendiente = item.mensualidades.filter(m => !m.pagado).length;
    return item;
  });

  return result;
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
      p.comprobante_pago,
      p.fecha_pago
    FROM matriculas m
      JOIN estudiantes e ON e.id_estudiante = m.estudiantes_id_estudiante
      JOIN secciones  s  ON s.id_seccion   = m.secciones_id_seccion

      -- listar mensualidades hasta mesTope
      LEFT JOIN mensualidades men
        ON ${ORDER_MES} BETWEEN 1 AND ?
      -- pago relaciona mensualidad con la matrícula específica
      LEFT JOIN pagos p
        ON p.mensualidades_id_pago = men.id_mes
       AND p.matriculas_id_matricula = m.id_matricula

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