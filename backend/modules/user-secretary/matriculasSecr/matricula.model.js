const db = require("../../../config/db");

const Matricula = {
  async crearEstudiante(datos) {
    const [result] = await db.execute(
      "INSERT INTO estudiantes (nombre_est, apellido_est, dni_est, fecha_nacimiento_est, estado_est, titular_est, convive_padres, genero, discapacidad_est, detalles_disc_est, descuentos_id_descuento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        datos.nombre_est,
        datos.apellido_est,
        datos.dni_est,
        datos.fecha_nacimiento_est,
        datos.estado_est,
        datos.titular_est,
        datos.convive_padres,
        datos.genero,
        datos.discapacidad_est,
        datos.detalles_disc_est || null,
        datos.descuentos_id_descuento || null
      ]
    );
    return result.insertId;
  },

  async crearResponsable(datos) {
    const [result] = await db.execute(
      "INSERT INTO responsable_legal (nombre_resp, apellido_resp, dni_resp, direc_domic_resp, parentesco_resp, telefono_resp, ocupacion_resp, email_resp, observaciones_resp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [datos.nombre_resp, datos.apellido_resp, datos.dni_resp, datos.direc_domic_resp, datos.parentesco_resp, datos.telefono_resp, datos.ocupacion_resp, datos.email_resp, datos.observaciones_resp]
    );
    return result.insertId;
  },

  async vincularEstudianteResponsable(estudianteId, responsableId, tipo_vinculo) {
    const [result] = await db.execute(
      "INSERT INTO estudiantes_responsable (estudiantes_id_estudiante, responsable_legal_id_responsable_legal, tipo_vinculo) VALUES (?, ?, ?)",
      [estudianteId, responsableId, tipo_vinculo]
    );
    return result.insertId;
  },

  async crearMatricula(datos) {
    const [result] = await db.execute(
      "INSERT INTO matriculas (fecha_matricula, estado_matr, tipo_mat, estudiantes_id_estudiante, periodos_id_periodo, usuarios_id_usuarios, secciones_id_seccion) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [datos.fecha_matricula, datos.estado_matr, datos.tipo_mat, datos.estudiantes_id_estudiante, datos.periodos_id_periodo, datos.usuarios_id_usuarios, datos.secciones_id_seccion]
    );
    return result.insertId;
  },
  async listarMatriculas() {
    const [rows] = await db.execute(
      `SELECT 
      m.id_matricula,
      m.fecha_matricula,
      m.estado_matr,
      m.tipo_mat,
      e.nombre_est,
      e.apellido_est,
      e.dni_est,
      e.titular_est,
      u.nombre_usuario,
      s.nombre as seccion_nombre,
      g.nombre_grad,
      n.nombre_niv,
      p.nombre_per,
      a.anio_acad
    FROM matriculas m
    JOIN estudiantes e ON m.estudiantes_id_estudiante = e.id_estudiante
    JOIN usuarios u ON m.usuarios_id_usuarios = u.id_usuarios
    JOIN secciones s ON m.secciones_id_seccion = s.id_seccion
    JOIN grados g ON s.grados_id_grado = g.id_grado
    JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
    JOIN periodos p ON m.periodos_id_periodo = p.id_periodo
    JOIN anio_academico a ON p.anio_academico_id_anio_escolar = a.id_anio_escolar
    ORDER BY m.fecha_matricula DESC`
    );
    return rows;
  },

  async obtenerMatriculaPorId(id) {
    const [rows] = await db.execute(
      `SELECT 
      m.*,
      e.*,
      p.id_periodo,
      s.id_seccion,
      g.id_grado,
      n.id_nivel,
      a.id_anio_escolar
    FROM matriculas m
    JOIN estudiantes e ON m.estudiantes_id_estudiante = e.id_estudiante
    JOIN periodos p ON m.periodos_id_periodo = p.id_periodo
    JOIN secciones s ON m.secciones_id_seccion = s.id_seccion
    JOIN grados g ON s.grados_id_grado = g.id_grado
    JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
    JOIN anio_academico a ON p.anio_academico_id_anio_escolar = a.id_anio_escolar
    WHERE m.id_matricula = ?`, [id]
    );
    return rows[0] || null;
  },

  async obtenerMatriculaCompleta(id) {
  // Obtener datos de matrícula y estudiante
  const [matriculaRows] = await db.execute(
    `SELECT 
      m.*,
      e.*,
      p.id_periodo,
      s.id_seccion,
      g.id_grado,
      n.id_nivel,
      a.id_anio_escolar
    FROM matriculas m
    JOIN estudiantes e ON m.estudiantes_id_estudiante = e.id_estudiante
    JOIN periodos p ON m.periodos_id_periodo = p.id_periodo
    JOIN secciones s ON m.secciones_id_seccion = s.id_seccion
    JOIN grados g ON s.grados_id_grado = g.id_grado
    JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
    JOIN anio_academico a ON p.anio_academico_id_anio_escolar = a.id_anio_escolar
    WHERE m.id_matricula = ?`, [id]
  );

  if (!matriculaRows[0]) return null;

  const matricula = matriculaRows[0];

  // Obtener responsables del estudiante
  const [responsablesRows] = await db.execute(
    `SELECT r.*, er.tipo_vinculo 
     FROM responsable_legal r
     JOIN estudiantes_responsable er ON r.id_responsable_legal = er.responsable_legal_id_responsable_legal
     WHERE er.estudiantes_id_estudiante = ?`,
    [matricula.id_estudiante]
  );

  return {
    matricula,
    responsables: responsablesRows
  };
},

async actualizarEstudiante(id, datos) {
  const [result] = await db.execute(
    "UPDATE estudiantes SET nombre_est = ?, apellido_est = ?, dni_est = ?, fecha_nacimiento_est = ?, estado_est = ?, titular_est = ?, convive_padres = ?, genero = ?, discapacidad_est = ?, detalles_disc_est = ?, descuentos_id_descuento = ? WHERE id_estudiante = ?",
    [
      datos.nombre_est,
      datos.apellido_est,
      datos.dni_est,
      datos.fecha_nacimiento_est,
      datos.estado_est,
      datos.titular_est,
      datos.convive_padres,
      datos.genero,
      datos.discapacidad_est,
      datos.detalles_disc_est || null,
      datos.descuentos_id_descuento || null,
      id
    ]
  );
  return result.affectedRows > 0;
},
async actualizarResponsable(id, datos) {
  const [result] = await db.execute(
    "UPDATE responsable_legal SET nombre_resp = ?, apellido_resp = ?, dni_resp = ?, direc_domic_resp = ?, parentesco_resp = ?, telefono_resp = ?, ocupacion_resp = ?, email_resp = ?, observaciones_resp = ? WHERE id_responsable_legal = ?",
    [
      datos.nombre_resp,
      datos.apellido_resp,
      datos.dni_resp,
      datos.direc_domic_resp,
      datos.parentesco_resp,
      datos.telefono_resp,
      datos.ocupacion_resp,
      datos.email_resp,
      datos.observaciones_resp,
      id
    ]
  );
  return result.affectedRows > 0;
},

async actualizarMatricula(id, datos) {
  const [result] = await db.execute(
    "UPDATE matriculas SET tipo_mat = ?, periodos_id_periodo = ?, secciones_id_seccion = ? WHERE id_matricula = ?",
    [datos.tipo_mat, datos.periodos_id_periodo, datos.secciones_id_seccion, id]
  );
  return result.affectedRows > 0;
},
// ===============================================
// FUNCION PARA EL MODULO ESTUDIANTES
// ===============================================

};
module.exports = Matricula;