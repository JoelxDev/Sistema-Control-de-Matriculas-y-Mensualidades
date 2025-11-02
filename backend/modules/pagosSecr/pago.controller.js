// ...existing code...
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

    // inicializar montoFinal con el monto enviado (por defecto 0)
    let montoFinal = Number(datos.monto || 0);
    let descuentoAplicado = null;

    // obtener matricula_id desde campos posibles
    const matriculaId = parseInt(datos.matricula_id || datos.matriculas_id_matricula || 0, 10) || null;

    // Si es matricula validar existencia, estudiante asociado y estado 'pendiente'
    if (datos.tipo_pago === 'Matricula') {
      if (!matriculaId) return res.status(400).json({ error: 'matricula_id requerido para pagos tipo Matricula' });

      const matricula = await Pago.obtenerMatriculaById(matriculaId);
      if (!matricula) return res.status(400).json({ error: 'Matrícula no encontrada' });
      if (!matricula.estudiantes_id_estudiante) return res.status(400).json({ error: 'La matrícula no tiene un estudiante asociado' });

      const estadoActual = String(matricula.estado_matr || matricula.estado_mat || '').trim().toLowerCase();
      if (estadoActual !== 'pendiente') {
        return res.status(400).json({ error: 'La matrícula debe estar en estado "pendiente" para registrar el pago' });
      }

      // aplicar descuento si el estudiante tiene uno
      const estudianteId = matricula.estudiantes_id_estudiante;
      const descuento = await Pago.obtenerDescuentoPorEstudiante(estudianteId);
      if (descuento && descuento.porcentaje_desc) {
        const pct = Number(descuento.porcentaje_desc) || 0;
        descuentoAplicado = pct;
        montoFinal = Number((montoFinal * (1 - pct / 100)).toFixed(2));
      }

      // asociar la matricula al pago
      datos.matriculas_id_matricula = matriculaId;
    } else {
      // Para otros tipos, si se proporcionó matricula_id intentar aplicar descuento también
      if (matriculaId) {
        const matricula = await Pago.obtenerMatriculaById(matriculaId);
        if (matricula && matricula.estudiantes_id_estudiante) {
          const descuento = await Pago.obtenerDescuentoPorEstudiante(matricula.estudiantes_id_estudiante);
          if (descuento && descuento.porcentaje_desc) {
            const pct = Number(descuento.porcentaje_desc) || 0;
            // decidir si aplicar según tipo de pago y fechas
            let aplicarDescuento = false;
            const hoy = new Date();

            if (String(datos.tipo_pago || '').toLowerCase() === 'mensualidad') {
              // intentar obtener la mensualidad asociada para verificar su fecha_limite
              const mensId = datos.mensualidades_id_pago || datos.mensualidad_id || null;
              console.debug('crearPago: mensId=', mensId, 'descuento=', descuento);
              if (mensId) {
                const mens = await MensualidadModel.obtenerPorId(Number(mensId));
                console.debug('crearPago: mensualidad=', mens);
                if (mens && mens.fecha_limite != null) {
                  // normalizar valor
                  let raw = mens.fecha_limite;
                  if (typeof raw === 'string') raw = raw.trim();
                  const limiteNum = Number(raw);
                  if (!Number.isNaN(limiteNum) && limiteNum >= 1 && limiteNum <= 31) {
                    // fecha_limite es día del mes
                    if (hoy.getDate() <= limiteNum) aplicarDescuento = true;
                  } else {
                    // intentar parsear como fecha completa
                    const fLim = new Date(raw);
                    if (!isNaN(fLim.getTime())) {
                      fLim.setHours(23,59,59,999);
                      if (hoy <= fLim) aplicarDescuento = true;
                    } else {
                      // no se pudo interpretar fecha_limite de la mensualidad -> no aplicar por seguridad
                      console.debug('crearPago: fecha_limite mensualidad no interpretable:', raw);
                    }
                  }
                } else {
                  // no hay fecha en la mensualidad -> usar fallback del descuento si existe
                  if (descuento && descuento.fecha_limite) {
                    const fLimDesc = new Date(descuento.fecha_limite);
                    if (!isNaN(fLimDesc.getTime())) {
                      fLimDesc.setHours(23,59,59,999);
                      if (hoy <= fLimDesc) aplicarDescuento = true;
                    }
                  }
                }
              } else {
                // no se indicó mensualidad -> usar fecha_limite del descuento como fallback
                if (descuento && descuento.fecha_limite) {
                  const fLimDesc = new Date(descuento.fecha_limite);
                  if (!isNaN(fLimDesc.getTime())) {
                    fLimDesc.setHours(23,59,59,999);
                    if (hoy <= fLimDesc) aplicarDescuento = true;
                  }
                }
              }
            } else {
              // otros tipos (ej. recibos generales): aplicar si fecha_limite del descuento no ha pasado
              if (descuento.fecha_limite) {
                const fLimDesc = new Date(descuento.fecha_limite);
                fLimDesc.setHours(23,59,59,999);
                if (hoy <= fLimDesc) aplicarDescuento = true;
              } else {
                // sin fecha límite definida, aplicar por defecto
                aplicarDescuento = true;
              }
            }

            if (aplicarDescuento) {
              descuentoAplicado = pct;
              montoFinal = Number((montoFinal * (1 - pct / 100)).toFixed(2));
            }
          }
        }
      }
    }

    // crear pago usando montoFinal
    const insertId = await Pago.crearPago({
      tipo_pago: datos.tipo_pago,
      monto: montoFinal,
      metodo_pago: datos.metodo_pago,
      descripcion: datos.descripcion,
      comprobante: datos.comprobante || null,
      mensualidades_id_pago: datos.mensualidades_id_pago || datos.mensualidad_id || null,
      matriculas_id_matricula: datos.matriculas_id_matricula || datos.matricula_id || null,
      usuarios_id_usuarios: datos.usuarios_id_usuarios || null,
      estimar_monto_id_estimar_monto: datos.estimar_monto_id_estimar_monto || datos.estimar_monto_id_estimar_monto || null
    });

    // Si fue un pago de matrícula, activar la matrícula (de 'pendiente' -> 'activo')
    if (datos.tipo_pago === 'Matricula') {
      const affected = await Pago.actualizarMatriculaEstado(datos.matriculas_id_matricula || datos.matricula_id, 'activo');
      if (!affected) {
        // rollback simple: eliminar pago creado si no se pudo actualizar matrícula
        await Pago.eliminarPagoById(insertId);
        return res.status(500).json({ error: 'No se pudo activar la matrícula después de crear el pago. Operación revertida.' });
      }
    }

    return res.status(201).json({
      insertedId: insertId,
      monto_final: montoFinal,
      descuento_aplicado: descuentoAplicado
    });
  } catch (err) {
    console.error('Error crearPago:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerMensualidadesPendientes = async (req, res) => {
  try {
    const hoy = new Date();
    const monthNum = hoy.getMonth() + 1;
    const year = hoy.getFullYear();

    // ahora obtenemos todas las matrículas activas (incluye las que ya pagaron este mes)
    const pendientes = await Pago.obtenerMensualidadesPendientes(monthNum, year);

    // mensualidades registradas (para calcular siguiente impaga)
    const mensualidadesRegistradas = await MensualidadModel.obtenerTodas();
    const normalizeMonth = s => String(s || '')
      .toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
      .replace(/\s+/g, ' ')
      .replace(/^setiembre$/, 'septiembre'); // mapa variantes

    const mesesOrden = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const ordenadas = (Array.isArray(mensualidadesRegistradas) ? mensualidadesRegistradas : [])
      .map(m => ({ ...m, mes_norm: normalizeMonth(m.mes) }))
      .filter(m => mesesOrden.includes(m.mes_norm))
      .sort((a,b) => mesesOrden.indexOf(a.mes_norm) - mesesOrden.indexOf(b.mes_norm));
    const mapById = new Map();
    ordenadas.forEach((m, idx) => mapById.set(m.id_mes, { ...m, index: idx }));

    const listaPromises = pendientes.map(async r => {
      // descuento vigente?
      let descuento_valido = false;
      let descuento_porcentaje = 0;
      if (r.id_descuento && r.fecha_limite_descuento) {
        const fechaLimiteDesc = new Date(r.fecha_limite_descuento);
        fechaLimiteDesc.setHours(23,59,59,999);
        if (hoy <= fechaLimiteDesc) {
          descuento_valido = true;
          descuento_porcentaje = Number(r.porcentaje_desc) || 0;
        }
      }

      // obtener pagos ya realizados para esta matrícula
      const pagosMat = await Pago.obtenerPagosPorMatricula(r.id_matricula);
      const pagosMensuales = (pagosMat || []).filter(p => String(p.tipo_pago || '').toLowerCase() === 'mensualidad');

      // si ya pagó este mes, marcarlo y no sugerir pago pendiente para este mes
      const yaPagadoEsteMes = Number(r.pagado_mes) === 1;

      // calcular primer mensualidad registrada impaga (solo si no pagó este mes)
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

      if (!yaPagadoEsteMes) {
        // preferir la fecha de la mensualidad (siguiente)
        if (siguiente && siguiente.fecha_limite) {
          const fechaLimiteMes = new Date(); // fechaLimiteMes será día del mes (número)
          // si fecha_limite en la tabla mensualidades es un número (día), comparar con día del mes actual
          const limiteVal = Number(siguiente.fecha_limite);
          if (!isNaN(limiteVal) && limiteVal >= 1 && limiteVal <= 31) {
            const diaHoy = hoy.getDate();
            if (diaHoy <= limiteVal) {
              descuento_valido = (r.id_descuento != null);
              descuento_porcentaje = descuento_valido ? (Number(r.porcentaje_desc) || 0) : 0;
            }
          } else {
            // si fecha_limite viene como fecha completa, comparar fechas
            const fLim = new Date(siguiente.fecha_limite);
            fLim.setHours(23,59,59,999);
            if (hoy <= fLim) {
              descuento_valido = (r.id_descuento != null);
              descuento_porcentaje = descuento_valido ? (Number(r.porcentaje_desc) || 0) : 0;
            }
          }
        } else if (r.id_descuento && r.fecha_limite_descuento) {
          const fechaLimiteDesc = new Date(r.fecha_limite_descuento);
          fechaLimiteDesc.setHours(23,59,59,999);
          if (hoy <= fechaLimiteDesc) {
            descuento_valido = true;
            descuento_porcentaje = Number(r.porcentaje_desc) || 0;
          }
        }
      }

      // representar último pago: tipo o nombre del mes
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

      return {
         id_matricula: r.id_matricula,
        id_estudiante: r.id_estudiante,
        nombre_est: r.nombre_est,
        apellido_est: r.apellido_est,
        dni_est: r.dni_est,
        fecha_matricula: r.fecha_matricula,
        nivel: r.nombre_niv || null,
        grado: r.nombre_grad || null,
        seccion: r.seccion_nombre || null,
        ultimo_pago: ultimoPagoDisplay,
        // Mostrar siempre el siguiente mes impago encontrado (si existe) independientemente de pagado_mes
        pago_pendiente_mes: siguiente ? siguiente.mes : null,
        pago_pendiente_id_mes: siguiente ? siguiente.id_mes : null,
        pago_pendiente_index: siguienteIndex !== null ? siguienteIndex : null,
        vencimiento_dia: siguiente ? siguiente.fecha_limite : null,
        descuento_aplicable: descuento_valido,
        descuento_porcentaje: descuento_porcentaje,
        // sigue devolviendo pagado_mes para UI (solo indicador)
        pagado_mes: !!Number(r.pagado_mes)
      };
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
        // Si es matrícula: mostrar porcentaje si existe descuento asociado, si no -> 'sin descuento'
        if (descuentoRecord && descuentoRecord.porcentaje_desc != null) {
          descuento_porcentaje = Number(descuentoRecord.porcentaje_desc) || 0;
          descuento_display = `${descuento_porcentaje}%`;
        } else {
          descuento_display = 'sin descuento';
        }
      } else if (descuentoRecord && descuentoRecord.porcentaje_desc != null) {
        descuento_porcentaje = Number(descuentoRecord.porcentaje_desc) || 0;
        if (montoEstimado != null && montoFinal != null && montoFinal < montoEstimado - 0.0001) {
          // asumimos que se aplicó descuento
          descuento_display = `${descuento_porcentaje}%`;
        } else {
          // existe descuento pero monto final no es menor -> no se aplicó (posiblemente fecha límite superada)
          descuento_display = 'no aplica (fecha limite superada)';
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