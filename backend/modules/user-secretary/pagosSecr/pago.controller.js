// ...existing code...
const Pago = require('./pago.model');

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
            descuentoAplicado = pct;
            montoFinal = Number((montoFinal * (1 - pct / 100)).toFixed(2));
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