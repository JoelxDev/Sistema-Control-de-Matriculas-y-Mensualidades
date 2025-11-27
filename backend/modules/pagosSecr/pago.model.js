const db = require("../../config/db");

const Pago = {
async crearPago(datos) {
  const montoRec = Number(datos.monto_recibido || 0);
  const [result] = await db.execute(
    `INSERT INTO pagos (
       tipo_pago,
       monto_pago,
       monto_recibido,
       estado_pago,
       metodo_pago,
       descripcion,
       comprobante_pag,
       fecha_pago,
       mensualidades_id_pago,
       matriculas_id_matricula,
       usuarios_id_usuarios,
       estimar_monto_id_estimar_monto
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      datos.tipo_pago || null,
      montoRec,              // igual al recibido
      montoRec,
      datos.estado_pago || 'Incompleto',
      datos.metodo_pago || null,
      datos.descripcion || null,
      datos.comprobante || null,
      new Date(),
      datos.mensualidades_id_pago || null,
      datos.matriculas_id_matricula || null,
      datos.usuarios_id_usuarios || null,
      datos.estimar_monto_id_estimar_monto || null
    ]
  );
  return result.insertId;
},
  
  async obtenerEstimadoById(id) {
    const [rows] = await db.execute(
      `SELECT id_estimar_monto, monto_base, descripcion
         FROM estimar_monto
        WHERE id_estimar_monto = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
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
    async obtenerMensualidadesPendientes(monthNum, year) {
    // devuelve todas las matrículas activas con info de pagos; incluye pagado_mes = 1 si ya pagó mensualidad en monthNum/year
    const [rows] = await db.execute(
      `
      SELECT 
        m.id_matricula,
        e.id_estudiante,
        e.nombre_est,
        e.apellido_est,
        e.dni_est,
        m.fecha_matricula,
        n.nombre_niv,
        g.nombre_grad,
        s.nombre AS seccion_nombre,

        -- último pago (fecha) de cualquier tipo
        (SELECT MAX(p2.fecha_pago) FROM pagos p2 WHERE p2.matriculas_id_matricula = m.id_matricula) AS ultimo_pago_any,

        -- tipo del último pago (Matricula, Mensualidad, etc.)
        (SELECT p3.tipo_pago FROM pagos p3 WHERE p3.matriculas_id_matricula = m.id_matricula ORDER BY p3.fecha_pago DESC LIMIT 1) AS ultimo_pago_tipo,

        -- si el último pago fue mensualidad, id de la mensualidad pagada (NULL si no hay)
        (SELECT p4.mensualidades_id_pago FROM pagos p4 WHERE p4.matriculas_id_matricula = m.id_matricula AND p4.tipo_pago = 'Mensualidad' ORDER BY p4.fecha_pago DESC LIMIT 1) AS ultimo_pago_mensual_id,

        -- último pago específicamente de tipo 'Mensualidad' (fecha) (puede ser NULL)
        (SELECT MAX(p5.fecha_pago) FROM pagos p5 WHERE p5.matriculas_id_matricula = m.id_matricula AND p5.tipo_pago = 'Mensualidad') AS ultimo_pago_mensual,

        -- pagado en el mes/año solicitado?
        EXISTS (
          SELECT 1 FROM pagos p
          WHERE p.tipo_pago = 'Mensualidad'
            AND p.matriculas_id_matricula = m.id_matricula
            AND MONTH(p.fecha_pago) = ?
            AND YEAR(p.fecha_pago) = ?
        ) AS pagado_mes,
        d.id_descuento,
        d.porcentaje_desc
      FROM matriculas m
      JOIN estudiantes e ON m.estudiantes_id_estudiante = e.id_estudiante
      LEFT JOIN secciones s ON m.secciones_id_seccion = s.id_seccion
      LEFT JOIN grados g ON s.grados_id_grado = g.id_grado
      LEFT JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
      LEFT JOIN descuentos d ON e.descuentos_id_descuento = d.id_descuento
      WHERE m.estado_matr = 'activo'
      ORDER BY n.nombre_niv, g.nombre_grad, s.nombre
    `,
      [monthNum, year]
    );
    return rows;
  },

  // nuevo: obtener todos los pagos con info básica del estudiante/matricula
  async obtenerTodos() {
    const [rows] = await db.execute(
      `SELECT p.*,
              m.id_matricula,
              m.estado_matr,
              e.id_estudiante,
              e.nombre_est,
              e.apellido_est,
              g.nombre_grad,
              n.nombre_niv,
              em.id_estimar_monto AS estimar_id,
              em.monto_base AS monto_estimado,
              em.descripcion AS estimar_descripcion
       FROM pagos p
       LEFT JOIN matriculas m ON p.matriculas_id_matricula = m.id_matricula
       LEFT JOIN estudiantes e ON m.estudiantes_id_estudiante = e.id_estudiante
       LEFT JOIN secciones s ON m.secciones_id_seccion = s.id_seccion
       LEFT JOIN grados g ON s.grados_id_grado = g.id_grado
       LEFT JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
       LEFT JOIN estimar_monto em ON p.estimar_monto_id_estimar_monto = em.id_estimar_monto
       ORDER BY p.fecha_pago DESC`
    );
    return rows;
  },
    async obtenerPagosIncompletos(anioAcadId = null) {
  // anio académico: matriculas -> periodos -> anio_academico
  const whereAnio = anioAcadId ? 'AND aa.id_anio_escolar = ?' : '';
  const params = [];
  if (anioAcadId) params.push(anioAcadId);

  const [rows] = await db.execute(
    `
    SELECT 
      p.tipo_pago,
      p.matriculas_id_matricula,
      p.mensualidades_id_pago,
      MAX(em.monto_base) AS monto_estimado,               -- agregado
      SUM(p.monto_recibido) AS monto_acumulado,
      COUNT(p.id_pagos) AS pagos_count,
      MAX(p.fecha_pago) AS ultimo_pago,
      MAX(p.estimar_monto_id_estimar_monto) AS estimar_monto_id_estimar_monto
    FROM pagos p
    LEFT JOIN estimar_monto em ON em.id_estimar_monto = p.estimar_monto_id_estimar_monto
    LEFT JOIN matriculas m ON m.id_matricula = p.matriculas_id_matricula
    LEFT JOIN periodos per ON per.id_periodo = m.periodos_id_periodo
    LEFT JOIN anio_academico aa ON aa.id_anio_escolar = per.anio_academico_id_anio_escolar
    WHERE p.tipo_pago IN ('Matricula','Mensualidad')
      ${whereAnio}
    GROUP BY p.tipo_pago, p.matriculas_id_matricula, p.mensualidades_id_pago
    HAVING monto_estimado > 0 AND monto_acumulado < monto_estimado
    ORDER BY ultimo_pago DESC
    `,
    params
  );
  return rows;
},

async actualizarEstadosAcumulados(tipoPago, matriculaId, mensualidadId) {
  const [rows] = await db.execute(
    `
    SELECT 
      MAX(em.monto_base) AS monto_estimado,        -- agregado
      SUM(p.monto_recibido) AS monto_acumulado
    FROM pagos p
    LEFT JOIN estimar_monto em ON em.id_estimar_monto = p.estimar_monto_id_estimar_monto
    WHERE p.tipo_pago = ?
      AND (p.matriculas_id_matricula = ? OR ? IS NULL)
      AND (p.mensualidades_id_pago = ? OR ? IS NULL)
    GROUP BY p.tipo_pago, p.matriculas_id_matricula, p.mensualidades_id_pago
    LIMIT 1
    `,
    [tipoPago, matriculaId || null, matriculaId || null, mensualidadId || null, mensualidadId || null]
  );
  if (!rows.length) return { actualizado: false };
  const { monto_estimado, monto_acumulado } = rows[0];
  const completo = Number(monto_acumulado) >= Number(monto_estimado) && monto_estimado > 0;

  if (completo) {
    await db.execute(
      `UPDATE pagos 
       SET estado_pago = 'Completo'
       WHERE tipo_pago = ?
         AND (matriculas_id_matricula = ? OR ? IS NULL)
         AND (mensualidades_id_pago = ? OR ? IS NULL)`,
      [tipoPago, matriculaId || null, matriculaId || null, mensualidadId || null, mensualidadId || null]
    );
  }
  return { actualizado: completo, monto_estimado, monto_acumulado };
},
async obtenerIncompletosMatrix(anioAcadId = null) {
    // 1. Matrículas activas con datos base
    const paramsMat = [];
    let whereAnio = '';
    if (anioAcadId) {
      whereAnio = 'AND aa.id_anio_escolar = ?';
      paramsMat.push(anioAcadId);
    }
    const [matriculas] = await db.execute(
      `
      SELECT 
        m.id_matricula,
        m.fecha_matricula,
        e.id_estudiante,
        e.nombre_est,
        e.apellido_est,
        e.dni_est,
        n.nombre_niv AS nivel,
        g.nombre_grad AS grado,
        s.nombre AS seccion,
        g.id_grado
      FROM matriculas m
      JOIN estudiantes e ON m.estudiantes_id_estudiante = e.id_estudiante
      LEFT JOIN secciones s ON m.secciones_id_seccion = s.id_seccion
      LEFT JOIN grados g ON s.grados_id_grado = g.id_grado
      LEFT JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
      LEFT JOIN periodos per ON per.id_periodo = m.periodos_id_periodo
      LEFT JOIN anio_academico aa ON aa.id_anio_escolar = per.anio_academico_id_anio_escolar
      WHERE m.estado_matr = 'activo' ${whereAnio}
      ORDER BY e.apellido_est, e.nombre_est
      `,
      paramsMat
    );

    if (!matriculas.length) return [];

    // 2. Sumas de pagos por matrícula (matricula) y por mensualidad
    // Pagos de matrícula
    const [sumMatricula] = await db.execute(`
      SELECT p.matriculas_id_matricula AS id_matricula,
             SUM(p.monto_recibido) AS suma_matricula
      FROM pagos p
      WHERE p.tipo_pago = 'Matricula'
      GROUP BY p.matriculas_id_matricula
    `);

    // Pagos mensuales por mes
    const [sumMensual] = await db.execute(`
      SELECT p.matriculas_id_matricula AS id_matricula,
             p.mensualidades_id_pago AS id_mes,
             SUM(p.monto_recibido) AS suma_mes
      FROM pagos p
      WHERE p.tipo_pago = 'Mensualidad'
        AND p.mensualidades_id_pago IS NOT NULL
      GROUP BY p.matriculas_id_matricula, p.mensualidades_id_pago
    `);

    // 3. Definiciones de montos (matrícula y mensualidad) por grado (fallback: generales)
    const [defMatricula] = await db.execute(`
      SELECT em.id_estimar_monto,
             em.monto_base,
             em.grados_id_grado
      FROM estimar_monto em
      WHERE em.tipo_est_mon = 'matricula'
    `);

    const [defMensual] = await db.execute(`
      SELECT em.id_estimar_monto,
             em.monto_base,
             em.grados_id_grado
      FROM estimar_monto em
      WHERE em.tipo_est_mon = 'mensualidad'
    `);

    // 4. Meses registrados
    const [meses] = await db.execute(`
      SELECT id_mes, mes
      FROM mensualidades
      ORDER BY id_mes
    `);

    // Map helpers
    const mapSumMatricula = new Map(sumMatricula.map(r => [r.id_matricula, Number(r.suma_matricula || 0)]));
    const mapSumMensual = new Map(); // key: matricula|mes
    sumMensual.forEach(r => {
      mapSumMensual.set(`${r.id_matricula}|${r.id_mes}`, Number(r.suma_mes || 0));
    });

    // Definiciones por grado (preferir exacto, si no, cualquiera con NULL)
    function obtenerMontoDef(tipoArray, id_grado) {
      const exacto = tipoArray.find(d => d.grados_id_grado === id_grado);
      if (exacto) return Number(exacto.monto_base);
      const general = tipoArray.find(d => d.grados_id_grado == null);
      return general ? Number(general.monto_base) : 0;
    }

    const mesesOrden = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    // asegurar orden correcto
    const mesesOrdenados = meses
      .map(m => ({ ...m, mes_norm: String(m.mes).toLowerCase() }))
      .sort((a,b) => mesesOrden.indexOf(a.mes_norm) - mesesOrden.indexOf(b.mes_norm));

    // 5. Construir filas
    const filas = [];
    for (const m of matriculas) {
      const montoMatriculaDef = obtenerMontoDef(defMatricula, m.id_grado);
      const sumaMatricula = mapSumMatricula.get(m.id_matricula) || 0;
      const pendienteMatricula = Math.max(montoMatriculaDef - sumaMatricula, 0);

      // Meses
      const mesesData = {};
      let tieneIncompleto = pendienteMatricula > 0;
      for (const mes of mesesOrdenados) {
        const montoMensDef = obtenerMontoDef(defMensual, m.id_grado);
        const sumaMes = mapSumMensual.get(`${m.id_matricula}|${mes.id_mes}`) || 0;
        const pendienteMes = Math.max(montoMensDef - sumaMes, 0);
        mesesData[mes.mes] = {
          esperado: montoMensDef,
          acumulado: sumaMes,
          pendiente: pendienteMes
        };
        if (pendienteMes > 0) tieneIncompleto = true;
      }

      // Mostrar sólo si hay al menos un incompleto
      if (tieneIncompleto) {
        filas.push({
          id_matricula: m.id_matricula,
          estudiante: `${m.apellido_est}, ${m.nombre_est}`,
          dni_est: m.dni_est,
          fecha_matricula: m.fecha_matricula,
          nivel: m.nivel,
            grado: m.grado,
          seccion: m.seccion,
          matricula_pendiente: pendienteMatricula,
          matricula_esperado: montoMatriculaDef,
          meses: mesesData
        });
      }
    }

    return filas;
  },
  async obtenerSecuenciasIncompletas(anioAcadId = null) {
  // Matrículas activas (filtra por año académico si se pasa)
  const paramsMat = [];
  let whereAnio = '';
  if (anioAcadId) {
    whereAnio = 'AND aa.id_anio_escolar = ?';
    paramsMat.push(anioAcadId);
  }
  const [matRows] = await db.execute(
    `
    SELECT m.id_matricula
    FROM matriculas m
    LEFT JOIN periodos per ON per.id_periodo = m.periodos_id_periodo
    LEFT JOIN anio_academico aa ON aa.id_anio_escolar = per.anio_academico_id_anio_escolar
    WHERE m.estado_matr = 'activo' ${whereAnio}
    `
    , paramsMat
  );
  const matriculaIds = matRows.map(r => r.id_matricula);
  if (!matriculaIds.length) return [];

  // Pagos de esas matrículas
  const [pagos] = await db.execute(
    `
    SELECT p.id_pagos, p.tipo_pago, p.matriculas_id_matricula, p.mensualidades_id_pago,
           p.monto_recibido, p.estado_pago, p.fecha_pago,
           em.monto_base AS estimado_raw
    FROM pagos p
    LEFT JOIN estimar_monto em ON em.id_estimar_monto = p.estimar_monto_id_estimar_monto
    WHERE p.matriculas_id_matricula IN (${matriculaIds.map(()=>'?').join(',')})
      AND p.tipo_pago IN ('Matricula','Mensualidad')
    ORDER BY p.matriculas_id_matricula, p.tipo_pago, p.mensualidades_id_pago, p.fecha_pago ASC
    `,
    matriculaIds
  );

  // Estimados por combinación (tomar MAX del monto_base visto o 0)
  const estimadosMap = new Map();
  pagos.forEach(p => {
    const key = `${p.tipo_pago}|${p.matriculas_id_matricula}|${p.mensualidades_id_pago||0}`;
    const prev = estimadosMap.get(key);
    const val = Number(p.estimado_raw || 0);
    if (!prev || val > prev) estimadosMap.set(key, val);
  });

  // También considerar grupos sin pagos (Pendiente) si hay definición estimada de matrícula/mensualidad previa
  // Definición estimada por grado no se incluyó aquí; si no hay pago no sabremos monto -> se omite.
  // (Opcional: agregar lógica para buscar estimar_monto por grado si quieres mostrar Pendiente sin pagos.)

  // Agrupar pagos por key
  const grupos = new Map();
  pagos.forEach(p => {
    const key = `${p.tipo_pago}|${p.matriculas_id_matricula}|${p.mensualidades_id_pago||0}`;
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push(p);
  });

  const resultado = [];
  for (const [key, listaPagos] of grupos.entries()) {
    const [tipo_pago, matricula_id, mens_id_str] = key.split('|');
    const mensualidades_id_pago = mens_id_str === '0' ? null : Number(mens_id_str);
    const estimado = estimadosMap.get(key) || 0;

    let acumulado = 0;
    const pagosDet = listaPagos.map(p => {
      acumulado += Number(p.monto_recibido || 0);
      return {
        id_pagos: p.id_pagos,
        fecha_pago: p.fecha_pago,
        monto_recibido: Number(p.monto_recibido || 0),
        acumulado: Number(acumulado.toFixed(2)),
        restante: Number(Math.max(estimado - acumulado, 0).toFixed(2)),
        estado_pago: p.estado_pago
      };
    });

    const completo = estimado > 0 && acumulado >= estimado;
    if (completo) {
      // No mostrar grupos completos
      continue;
    }
    const estado_grupo = pagosDet.length === 0 ? 'Pendiente' : 'Incompleto';

    resultado.push({
      tipo_pago,
      matricula_id: Number(matricula_id),
      mensualidades_id_pago,
      estimado: Number(estimado.toFixed(2)),
      estado_grupo,
      pagos: pagosDet
    });
  }

  // (Opcional) añadir grupos Pendiente sin pagos si puedes derivar estimado externo (no implementado aquí).
  return resultado;
},
}

module.exports = Pago;