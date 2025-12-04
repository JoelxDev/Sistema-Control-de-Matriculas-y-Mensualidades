const Pago = require('./pago.model');
const MensualidadModel = require('../mensualidadesSecr/mensua.model'); // <-- new dependency


exports.obtenerMatriculaInfo = async (req, res) => {
  try {
    const { matriculaId } = req.params;
    const id = parseInt(matriculaId, 10);
    if (!id) return res.status(400).json({ error: 'matriculaId inválido' });

    const detalle = await Pago.obtenerMatriculaDetalle(id);
    if (!detalle) return res.status(404).json({ error: 'Matrícula no encontrada' });

    const estado = String(detalle.estado_matr || detalle.estado_mat || '').trim().toLowerCase();
    if (estado !== 'pendiente') return res.status(400).json({ error: 'La matrícula no está en estado pendiente' });

    // obtener descuento asociado al estudiante (si existe)
    let descuento_porcentaje = null;
    if (detalle.estudiantes_id_estudiante) {
      const d = await Pago.obtenerDescuentoPorEstudiante(detalle.estudiantes_id_estudiante);
      if (d && d.porcentaje_desc) descuento_porcentaje = Number(d.porcentaje_desc) || 0;
    }

    return res.json({
      id_matricula: detalle.id_matricula,
      estudiantes_id_estudiante: detalle.estudiantes_id_estudiante,
      seccion_id: detalle.secciones_id_seccion,
      seccion_nombre: detalle.nombre_seccion || null,
      grado_id: detalle.id_grado || null,
      grado_nombre: detalle.nombre_grad || null,
      nivel_id: detalle.niveles_id_nivel || detalle.id_nivel || null,
      nivel_nombre: detalle.nombre_nivel || null,
      descuento_porcentaje
    });
  } catch (err) {
    console.error('Error obtenerMatriculaInfo:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerMontosMatricula = async (req, res) => {
  try {
    const { nivelId, gradoId } = req.query;
    const montos = await Pago.obtenerMontosMatricula(nivelId || null, gradoId || null);
    res.json(montos);
  } catch (error) {
    console.error('Error obtenerMontosMatricula:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.obtenerPagosPorMatricula = async (req, res) => {
  try {
    const { matriculaId } = req.params;
    const pagos = await Pago.obtenerPagosPorMatricula(matriculaId);
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crearPago = async (req, res) => {
  try {
    const datos = req.body || {};
    const tipoRaw = String(datos.tipo_pago || '').trim();
    const tipoNorm = tipoRaw.toLowerCase();

    const estimarId = datos.estimar_monto_id_estimar_monto || null;
    const estimado = estimarId ? await Pago.obtenerEstimadoById(estimarId) : null;
    const montoEstimado = estimado ? Number(estimado.monto_base) : Number(datos.monto || 0);
    const montoRecibido = Number(datos.monto_recibido || 0);

    // Calcular monto final (monto_pago)
    let montoFinal = montoEstimado;
    let descuentoAplicado = 0;

    // Aplicar descuento solo para mensualidad si está vigente
    if (tipoNorm === 'mensualidad' && datos.descuento_pct != null) {
      const descuentoPct = Number(datos.descuento_pct || 0);
      const mensualidadId = datos.mensualidades_id_pago || null;

      // Verificar que el descuento esté vigente comparando con fecha límite de la mensualidad
      let descuentoVigente = false;

      if (descuentoPct > 0 && mensualidadId) {
        try {
          const mensualidad = await MensualidadModel.obtenerPorId(mensualidadId);
          if (mensualidad && mensualidad.fecha_limite != null) {
            const limiteVal = Number(mensualidad.fecha_limite);

            if (!isNaN(limiteVal) && limiteVal >= 1 && limiteVal <= 31) {
              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0);
              const monthNum = hoy.getMonth() + 1;
              const year = hoy.getFullYear();

              const normalizeMonth = s => String(s || '')
                .toLowerCase().trim()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, ' ')
                .replace(/^setiembre$/, 'septiembre');

              const mesesOrden = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
              const mesNorm = normalizeMonth(mensualidad.mes);
              const mesPendienteIndex = mesesOrden.indexOf(mesNorm);

              if (mesPendienteIndex !== -1) {
                const mesPendienteNum = mesPendienteIndex + 1;

                if (mesPendienteNum >= monthNum) {
                  const fechaLimite = new Date(year, mesPendienteNum - 1, limiteVal, 23, 59, 59, 999);
                  descuentoVigente = (hoy <= fechaLimite);
                }
              }
            }
          }
        } catch (err) {
          console.error('Error verificando vigencia de descuento:', err);
        }
      }

      // Solo aplicar descuento si está vigente
      if (descuentoVigente && descuentoPct > 0) {
        montoFinal = montoEstimado * (1 - (descuentoPct / 100));
        descuentoAplicado = descuentoPct;
      }
    }

    // Determinar estado del pago comparando monto recibido con monto final
    const estadoPago = montoRecibido >= montoFinal ? 'Completo' : 'Incompleto';

    const matriculaId = datos.matricula_id || datos.matriculas_id_matricula || null;
    const mensualidadId = datos.mensualidades_id_pago || null;

    if (tipoNorm === 'matricula') {
  if (!matriculaId) return res.status(400).json({ error: 'matricula_id requerido' });
  const mat = await Pago.obtenerMatriculaById(matriculaId);
  if (!mat) return res.status(404).json({ error: 'Matrícula no encontrada' });
  
  // Permitir pagos si está pendiente O si está activa (para completar pagos incompletos)
  const estadoMat = String(mat.estado_matr || '').toLowerCase();
  if (estadoMat !== 'pendiente' && estadoMat !== 'activo') {
    return res.status(400).json({ error: 'La matrícula debe estar pendiente o activa para registrar pagos' });
  }
}

    const insertId = await Pago.crearPago({
      tipo_pago: tipoRaw,
      monto_pago: montoRecibido,        // SIEMPRE igual a monto_recibido
      monto_recibido: montoRecibido,
      estado_pago: estadoPago,
      metodo_pago: datos.metodo_pago,
      descripcion: datos.descripcion,
      comprobante: datos.comprobante || null,
      mensualidades_id_pago: mensualidadId,
      matriculas_id_matricula: matriculaId || null,
      usuarios_id_usuarios: datos.usuarios_id_usuarios || null,
      estimar_monto_id_estimar_monto: estimarId
    });

    // Recalcular acumulado y actualizar estados
    const acumuladoInfo = await Pago.actualizarEstadosAcumulados(tipoRaw, matriculaId || null, mensualidadId || null);

    // Activar matrícula incluso si incompleto (según tu requerimiento)
    if (tipoNorm === 'matricula') {
      await Pago.actualizarMatriculaEstado(matriculaId, 'activo');
    }

    return res.status(201).json({
      id_pago: insertId,
      tipo_pago: tipoRaw,
      monto_estimado: montoEstimado,
      monto_final: montoFinal,
      monto_recibido: montoRecibido,
      descuento_aplicado: descuentoAplicado,
      estado_pago: estadoPago,
      acumulado: acumuladoInfo
    });
  } catch (e) {
    console.error('crearPago error:', e);
    return res.status(500).json({ error: e.message });
  }
};

exports.obtenerPagosIncompletos = async (req, res) => {
  try {
    const { anioAcadId } = req.query; // opcional
    const lista = await Pago.obtenerPagosIncompletos(anioAcadId || null);
    res.json(lista);
  } catch (e) {
    console.error('obtenerPagosIncompletos error:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.obtenerMensualidadesPendientes = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Establecer a medianoche para comparación precisa
    const monthNum = hoy.getMonth() + 1;
    const year = hoy.getFullYear();

    const pendientes = await Pago.obtenerMensualidadesPendientes(monthNum, year);

    const mensualidadesRegistradas = await MensualidadModel.obtenerTodas();
    const normalizeMonth = s => String(s || '')
      .toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^setiembre$/, 'septiembre');

    const mesesOrden = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const ordenadas = (Array.isArray(mensualidadesRegistradas) ? mensualidadesRegistradas : [])
      .map(m => ({ ...m, mes_norm: normalizeMonth(m.mes) }))
      .filter(m => mesesOrden.includes(m.mes_norm))
      .sort((a, b) => mesesOrden.indexOf(a.mes_norm) - mesesOrden.indexOf(b.mes_norm));
    const mapById = new Map();
    ordenadas.forEach((m, idx) => mapById.set(m.id_mes, { ...m, index: idx }));

    const listaPromises = pendientes.map(async r => {
      const descuento_porcentaje = r.id_descuento ? (Number(r.porcentaje_desc) || 0) : 0;
      const tiene_descuento = r.id_descuento != null;

      const pagosMat = await Pago.obtenerPagosPorMatricula(r.id_matricula);
      const pagosMensuales = (pagosMat || []).filter(p => String(p.tipo_pago || '').toLowerCase() === 'mensualidad');

      const yaPagadoEsteMes = Number(r.pagado_mes) === 1;

      let siguiente = null;
      let siguienteIndex = null;
      if (ordenadas.length > 0) {
        for (let i = 0; i < ordenadas.length; i++) {
          const m = ordenadas[i];
          const pagado = pagosMensuales.some(pm => {
            return pm.mensualidades_id_pago !== null && pm.mensualidades_id_pago !== undefined
              && Number(pm.mensualidades_id_pago) === Number(m.id_mes);
          });
          if (!pagado) {
            siguiente = m;
            siguienteIndex = i;
            break;
          }
        }
      }

      // El descuento se aplica si existe descuento Y estamos dentro de la fecha límite de la mensualidad pendiente
      let descuento_aplicable = false;
      if (tiene_descuento && siguiente && siguiente.fecha_limite != null) {
        const limiteVal = Number(siguiente.fecha_limite);

        // Si fecha_limite es un número entre 1-31, es el día del mes
        if (!isNaN(limiteVal) && limiteVal >= 1 && limiteVal <= 31) {
          // Obtener el índice del mes de la mensualidad pendiente
          const mesPendienteIndex = mesesOrden.indexOf(siguiente.mes_norm);

          if (mesPendienteIndex !== -1) {
            // Crear fecha límite usando el mes de la mensualidad pendiente
            // Si el mes pendiente ya pasó en el año actual, usar el año siguiente
            const mesPendienteNum = mesPendienteIndex + 1; // meses 1-12
            let yearLimite = year;

            // Si el mes pendiente es anterior al mes actual, significa que es del año pasado
            if (mesPendienteNum < monthNum) {
              // El mes pendiente ya pasó, el descuento no aplica
              descuento_aplicable = false;
            } else {
              // Construir la fecha límite con el mes correcto
              const fechaLimite = new Date(yearLimite, mesPendienteNum - 1, limiteVal, 23, 59, 59, 999);
              descuento_aplicable = (hoy <= fechaLimite);

              console.log(`DEBUG - Estudiante ${r.nombre_est}:`, {
                fecha_actual: hoy.toISOString().split('T')[0],
                fecha_limite: fechaLimite.toISOString().split('T')[0],
                mes_pendiente: siguiente.mes,
                mes_pendiente_num: mesPendienteNum,
                dia_limite: limiteVal,
                descuento_aplicable
              });
            }
          } else {
            console.log(`DEBUG - Estudiante ${r.nombre_est}: mes pendiente no reconocido:`, siguiente.mes);
          }
        }
      } else {
        console.log(`DEBUG - Estudiante ${r.nombre_est}:`, {
          tiene_descuento,
          tiene_siguiente: !!siguiente,
          fecha_limite: siguiente?.fecha_limite,
          razon: !tiene_descuento ? 'No tiene descuento' : !siguiente ? 'No tiene mensualidad pendiente' : 'No tiene fecha límite'
        });
      }

      let ultimoPagoDisplay = null;
      const tipoUltimo = (r.ultimo_pago_tipo || '').trim();
      if (tipoUltimo && tipoUltimo.toLowerCase() === 'mensualidad' && r.ultimo_pago_mensual_id) {
        const mObj = mapById.get(Number(r.ultimo_pago_mensual_id));
        ultimoPagoDisplay = mObj ? mObj.mes : 'Mensualidad';
      } else if (tipoUltimo) {
        ultimoPagoDisplay = tipoUltimo;
      } else {
        ultimoPagoDisplay = null;
      }

      const resultado = {
        id_matricula: r.id_matricula,
        id_estudiante: r.id_estudiante,
        nombre_est: r.nombre_est,
        apellido_est: r.apellido_est,
        dni_est: r.dni_est,
        fecha_matricula: r.fecha_matricula,
        nivel: r.nombre_niv || null,
        grado: r.nombre_grad || null,
        seccion: r.seccion_nombre || null,
        niveles_id_nivel: r.niveles_id_nivel || null,
        grados_id_grado: r.grados_id_grado || null,
        secciones_id_seccion: r.secciones_id_seccion || null,
        ultimo_pago: ultimoPagoDisplay,
        pago_pendiente_mes: siguiente ? siguiente.mes : null,
        pago_pendiente_id_mes: siguiente ? siguiente.id_mes : null,
        pago_pendiente_index: siguienteIndex !== null ? siguienteIndex : null,
        vencimiento_dia: siguiente ? siguiente.fecha_limite : null,
        descuento_aplicable: descuento_aplicable,
        descuento_porcentaje: descuento_porcentaje,
        pagado_mes: !!Number(r.pagado_mes)
      };

      console.log(`DEBUG - Resultado final para ${r.nombre_est}:`, {
        descuento_aplicable: resultado.descuento_aplicable,
        descuento_porcentaje: resultado.descuento_porcentaje,
        mes_pendiente: resultado.pago_pendiente_mes
      });

      return resultado;
    });

    const lista = await Promise.all(listaPromises);
    res.json(lista);
  } catch (err) {
    console.error('Error obtenerMensualidadesPendientes:', err);
    res.status(500).json({ error: err.message });
  }
};

// nuevo endpoint: devolver mensualidades registradas (para poblar desplegable)
exports.obtenerMensualidadesRegistradas = async (req, res) => {
  try {
    const mens = await MensualidadModel.obtenerTodas();
    res.json(Array.isArray(mens) ? mens : []);
  } catch (err) {
    console.error('Error obtenerMensualidadesRegistradas:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerTodosPagos = async (req, res) => {
  try {
    const pagos = await Pago.obtenerTodos();
    if (!Array.isArray(pagos) || pagos.length === 0) return res.json([]);

    const lista = [];
    for (const p of pagos) {
      // normalizar tipo
      const tipo = String(p.tipo_pago || '').trim();

      // por defecto
      let mesDisplay = 'no aplica';
      let fechaLimiteDisplay = null;

      // si es mensualidad intentar obtener la mensualidad para mostrar mes/fecha_limite
      let mensualidad = null;
      if (tipo.toLowerCase() === 'mensualidad' && p.mensualidades_id_pago) {
        try {
          mensualidad = await MensualidadModel.obtenerPorId(Number(p.mensualidades_id_pago));
          if (mensualidad) {
            mesDisplay = mensualidad.mes || '';
            // formatear fecha_limite: si es número -> mostrar "día X", si es fecha -> toLocaleDateString
            const raw = mensualidad.fecha_limite;
            if (raw != null) {
              const num = Number(raw);
              if (!Number.isNaN(num) && num >= 1 && num <= 31) {
                fechaLimiteDisplay = `día ${num}`;
              } else {
                const d = new Date(raw);
                if (!isNaN(d.getTime())) fechaLimiteDisplay = d.toLocaleDateString();
                else fechaLimiteDisplay = String(raw);
              }
            }
          }
        } catch (err) {
          console.debug('obtenerTodosPagos: error al obtener mensualidad', err);
        }
      }

      // obtener matricula y descuento asociado (si existe)
      let descuentoRecord = null;
      if (p.matriculas_id_matricula) {
        try {
          const mat = await Pago.obtenerMatriculaById(p.matriculas_id_matricula);
          if (mat && mat.estudiantes_id_estudiante) {
            descuentoRecord = await Pago.obtenerDescuentoPorEstudiante(mat.estudiantes_id_estudiante);
          }
        } catch (err) {
          console.debug('obtenerTodosPagos: error al obtener matricula/descuento', err);
        }
      }

      // determinar si descuento se aplicó comparando monto_estimado vs monto_pago cuando sea posible
      let descuento_display = 'sin descuento';
      let descuento_porcentaje = null;
      const montoEstimado = (p.monto_estimado != null) ? Number(p.monto_estimado) : (p.monto_base != null ? Number(p.monto_base) : null);
      const montoFinal = (p.monto_pago != null) ? Number(p.monto_pago) : null;

      if (String(tipo).toLowerCase() === 'matricula') {
        // SIEMPRE mostrar 'sin descuento' y null porcentaje, aunque el estudiante tenga descuento
        descuento_display = 'sin descuento';
        descuento_porcentaje = null;
      } else if (descuentoRecord && descuentoRecord.porcentaje_desc != null) {
        descuento_porcentaje = Number(descuentoRecord.porcentaje_desc) || 0;
        if (montoEstimado != null && montoFinal != null && montoFinal < montoEstimado - 0.0001) {
          // asumimos que se aplicó descuento
          descuento_display = `${descuento_porcentaje}%`;
        } else {
          // existe descuento pero monto final no es menor -> no se aplicó (posiblemente fecha límite superada)
          descuento_display = 'fecha límite superada';
        }
      } else {
        descuento_display = 'sin descuento';
      }

      lista.push({
        ...p,
        tipo_pago: tipo,
        mes_display: mesDisplay,
        fecha_limite_display: fechaLimiteDisplay,
        monto_estimado: montoEstimado,
        monto_recibido: p.monto_recibido != null ? Number(p.monto_recibido) : null,
        monto_final: montoFinal,
        descuento_display,
        descuento_porcentaje
      });
    }

    res.json(lista);
  } catch (err) {
    console.error('Error obtenerTodosPagos:', err);
    res.status(500).json({ error: err.message });
  }
};
exports.obtenerMontosIncompletosMatrix = async (req, res) => {
  try {
    const { anioAcadId } = req.query;
    const filas = await Pago.obtenerIncompletosMatrix(anioAcadId || null);
    res.json(filas);
  } catch (e) {
    console.error('Error obtenerMontosIncompletosMatrix:', e);
    res.status(500).json({ error: e.message });
  }
};

exports.obtenerSecuenciasIncompletas = async (req, res) => {
  try {
    const { anioAcadId } = req.query;
    const data = await Pago.obtenerSecuenciasIncompletas(anioAcadId || null);
    res.json(data);
  } catch (e) {
    console.error('Error obtenerSecuenciasIncompletas:', e);
    res.status(500).json({ error: e.message });
  }
};