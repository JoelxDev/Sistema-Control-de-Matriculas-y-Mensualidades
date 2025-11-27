const MensualidadModel = require('./mensua.model');
const PDFDocument = require('pdfkit');

class MensuaController {
    // Crear nueva mensualidad
    static async crearMensualidad(req, res) {
        try {
            const { mes, fecha_limite, descripcion_mes } = req.body;

            // Validaciones
            if (!mes || !fecha_limite) {
                return res.status(400).json({
                    success: false,
                    message: 'Mes y fecha límite son campos obligatorios'
                });
            }

            // Validar fecha límite
            const fechaLimite = parseInt(fecha_limite);
            if (isNaN(fechaLimite) || fechaLimite < 1 || fechaLimite > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha límite debe ser un número entre 1 y 30'
                });
            }

            // Verificar si el mes ya existe
            const mesExiste = await MensualidadModel.existeMes(mes);
            if (mesExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'Este mes ya está registrado'
                });
            }

            // Crear mensualidad
            const resultado = await MensualidadModel.crear({
                mes: mes.toLowerCase(),
                fecha_limite: fechaLimite,
                descripcion_mes: descripcion_mes || null
            });

            res.status(201).json({
                success: true,
                message: 'Mensualidad creada exitosamente',
                data: {
                    id_mes: resultado.insertId,
                    mes,
                    fecha_limite: fechaLimite,
                    descripcion_mes
                }
            });

        } catch (error) {
            console.error('Error al crear mensualidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener todas las mensualidades
    static async obtenerMensualidades(req, res) {
        try {
            const mensualidades = await MensualidadModel.obtenerTodas();
            
            res.status(200).json({
                success: true,
                message: 'Mensualidades obtenidas exitosamente',
                data: mensualidades
            });

        } catch (error) {
            console.error('Error al obtener mensualidades:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener mensualidad por ID
    static async obtenerMensualidadPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            const mensualidad = await MensualidadModel.obtenerPorId(id);

            if (!mensualidad) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensualidad no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Mensualidad obtenida exitosamente',
                data: mensualidad
            });

        } catch (error) {
            console.error('Error al obtener mensualidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar mensualidad
    static async actualizarMensualidad(req, res) {
        try {
            const { id } = req.params;
            const { mes, fecha_limite, descripcion_mes } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            // Verificar si existe la mensualidad
            const mensualidadExiste = await MensualidadModel.obtenerPorId(id);
            if (!mensualidadExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensualidad no encontrada'
                });
            }

            // Validaciones
            if (!mes || !fecha_limite) {
                return res.status(400).json({
                    success: false,
                    message: 'Mes y fecha límite son campos obligatorios'
                });
            }

            // Validar fecha límite
            const fechaLimite = parseInt(fecha_limite);
            if (isNaN(fechaLimite) || fechaLimite < 1 || fechaLimite > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha límite debe ser un número entre 1 y 30'
                });
            }

            // Verificar si el mes ya existe (excluyendo el actual)
            const mesExiste = await MensualidadModel.existeMes(mes, id);
            if (mesExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'Este mes ya está registrado'
                });
            }

            // Actualizar mensualidad
            await MensualidadModel.actualizar(id, {
                mes: mes.toLowerCase(),
                fecha_limite: fechaLimite,
                descripcion_mes: descripcion_mes || null
            });

            res.status(200).json({
                success: true,
                message: 'Mensualidad actualizada exitosamente',
                data: {
                    id_mes: id,
                    mes,
                    fecha_limite: fechaLimite,
                    descripcion_mes
                }
            });

        } catch (error) {
            console.error('Error al actualizar mensualidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Eliminar mensualidad
    static async eliminarMensualidad(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            // Verificar si existe la mensualidad
            const mensualidadExiste = await MensualidadModel.obtenerPorId(id);
            if (!mensualidadExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensualidad no encontrada'
                });
            }

            // Eliminar mensualidad
            await MensualidadModel.eliminar(id);

            res.status(200).json({
                success: true,
                message: 'Mensualidad eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar mensualidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    static async listarMeses(req, res) {
        try {
            const meses = await MensualidadModel.obtenerMeses();
            res.json({ meses });
        } catch (err) {
            console.error('listarMeses:', err);
            res.status(500).json({ error: 'Error interno' });
        }
    }

    static async listarPagosPorSeccion(req, res) {
        try {
            const idSeccion = Number(req.params.id);
            if (!idSeccion) return res.status(400).json({ error: 'id de sección inválido' });

            const incluirFuturos = req.query.incluirFuturos === '1' || req.query.incluirFuturos === 'true';
            const hastaMes = Number(req.query.hastaMes);
            const mesTope = incluirFuturos ? 12 : (hastaMes || (new Date().getMonth() + 1));

            const rows = await MensualidadModel.obtenerPagosPorSeccion(idSeccion, mesTope);
            res.json({ rows });
        } catch (err) {
            console.error('listarPagosPorSeccion:', err);
            res.status(500).json({ error: 'Error interno' });
        }
    }

  static async descargarPdfPorSeccion(req, res) {
    try {
      const idSeccion = Number(req.params.id);
      const hastaMes = Number(req.query.hastaMes) || (new Date().getMonth() + 1);
      if (!idSeccion) return res.status(400).json({ message: 'id de sección inválido' });

      const rows = await MensualidadModel.obtenerPagosPorSeccion(idSeccion, hastaMes);

      // intentar obtener nivel/grado/nombre de sección desde la primera fila (si están)
      const first = (rows && rows.length) ? rows[0] : {};
      const nivelName = first.nombre_niv || first.nombre_nivel || first.nivel || '';
      const gradoName = first.nombre_grad || first.nombre_grado || first.grado || '';
      const seccionName = first.nombre_seccion || first.nombre || first.seccion || `Sección ${idSeccion}`;

      const porEst = new Map();
      rows.forEach(r => {
        const key = r.id_estudiante;
        if (!porEst.has(key)) porEst.set(key, {
          id_estudiante: r.id_estudiante,
          nombre: `${r.apellido_est || ''}, ${r.nombre_est || ''}`.replace(/^,\s*/, ''),
          matricula: r.id_matricula,
          meses: {}
        });
        porEst.get(key).meses[(r.mes || '').toLowerCase()] = {
          pagado: !!r.pagado,
          fecha_pago: r.fecha_pago ? String(r.fecha_pago).split('T')[0] : null,
          monto: r.monto_pago || null,
          comprobante: r.comprobante_pago || null
        };
      });

      // PDF en horizontal (landscape) para más espacio
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 28 });
      const filename = `mensualidades_seccion_${idSeccion}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      doc.pipe(res);

      const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const mesesCab = MONTHS.slice(0, hastaMes);
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      // Cabecera: incluir Nivel - Grado - Nombre_seccion
      const title = `Reporte de Mensualidades - ${nivelName || 'Nivel'} - ${gradoName || 'Grado'} - ${seccionName}`;
      doc.fontSize(14).text(title, { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(9).text(`Generado: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown(0.6);

      // Columnas: reducir espacio para nombre de estudiantes
      const colEstudianteW = Math.max(120, Math.floor(pageWidth * 0.24)); // menos ancho que antes
      const colMatW = 80;
      const remaining = pageWidth - colEstudianteW - colMatW - 10;
      const colMesW = Math.max(40, Math.floor(remaining / Math.max(1, mesesCab.length)));

      // Header row
      const startX = doc.x;
      let y = doc.y;
      const headerH = 22;
      doc.rect(startX, y, pageWidth, headerH).fill('#e9e9e9');
      doc.fillColor('black').fontSize(9);
      doc.text('Estudiante', startX + 6, y + 6, { width: colEstudianteW - 12 });
      doc.text('Matrícula', startX + colEstudianteW + 6, y + 6, { width: colMatW - 12, align: 'center' });
      mesesCab.forEach((m, i) => {
        const x = startX + colEstudianteW + colMatW + i * colMesW + 6;
        doc.text(m.slice(0,6), x, y + 6, { width: colMesW - 8, align: 'center' });
      });
      y += headerH + 4;

      // Filas
      doc.fontSize(9);
      const rowHeight = 20;
      const items = Array.from(porEst.values());
      for (let i = 0; i < items.length; i++) {
        const est = items[i];

        if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage({ size: 'A4', layout: 'landscape', margin: 28 });
          y = doc.y;
          // redraw header on new page
          doc.rect(startX, y, pageWidth, headerH).fill('#e9e9e9');
          doc.fillColor('black').fontSize(9);
          doc.text('Estudiante', startX + 6, y + 6, { width: colEstudianteW - 12 });
          doc.text('Matrícula', startX + colEstudianteW + 6, y + 6, { width: colMatW - 12, align: 'center' });
          mesesCab.forEach((m, idx) => {
            const xh = startX + colEstudianteW + colMatW + idx * colMesW + 6;
            doc.text(m.slice(0,6), xh, y + 6, { width: colMesW - 8, align: 'center' });
          });
          y += headerH + 4;
        }

        // Alternating background
        doc.rect(startX, y - 2, pageWidth, rowHeight).fill(i % 2 === 0 ? '#ffffff' : '#f7f7f7');
        doc.fillColor('black');

        // Datos
        doc.text(est.nombre, startX + 6, y + 3, { width: colEstudianteW - 12, ellipsis: true });
        doc.text(String(est.matricula || '-'), startX + colEstudianteW + 6, y + 3, { width: colMatW - 12, align: 'center' });

        mesesCab.forEach((m, idx) => {
          const cell = est.meses[(m || '').toLowerCase()];
          const x = startX + colEstudianteW + colMatW + idx * colMesW + 6;
          let text = '-';
          let fontSize = 9; // tamaño por defecto
          
          if (!cell) {
            text = '-';
          } else if (cell.pagado) {
            const fecha = cell.fecha_pago || '';
            if (fecha) {
              const parts = fecha.split('-');
              if (parts.length === 3) text = `${parts[2]}/${parts[1]}/${parts[0]}`;
              else text = fecha;
            } else {
              text = 'Pagado';
            }
          } else {
            text = 'Pendiente';
            fontSize = 7; // reducir tamaño para "Pendiente"
          }
          
          doc.fontSize(fontSize).text(text, x, y + 3, { width: colMesW - 8, align: 'center' });
          doc.fontSize(9); // restaurar tamaño por defecto
        });

        y += rowHeight;
      }

      doc.end();
    } catch (err) {
      console.error('Error generando PDF mensualidades:', err);
      if (!res.headersSent) res.status(500).json({ message: 'Error al generar PDF' });
    }
  }

}

module.exports = MensuaController;