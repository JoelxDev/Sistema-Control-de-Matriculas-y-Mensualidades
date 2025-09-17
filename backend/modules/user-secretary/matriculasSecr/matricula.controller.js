const Matricula = require("./matricula.model");

exports.registrarMatriculaCompleta = async (req, res) => {
  try {
    // 1. Registrar estudiante
    const estudianteId = await Matricula.crearEstudiante(req.body.estudiante);

    // 2. Registrar responsables y vincular
    for (const responsable of req.body.responsables) {
      const responsableId = await Matricula.crearResponsable(responsable);
      await Matricula.vincularEstudianteResponsable(estudianteId, responsableId, responsable.tipo_vinculo);
    }

    // 3. Registrar matrícula
    const matriculaId = await Matricula.crearMatricula({
      ...req.body.matricula,
      estudiantes_id_estudiante: estudianteId
    });

    res.status(201).json({ matriculaId, estudianteId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar matrícula completa" });
  }
};

exports.listarMatriculas = async (req, res) => {
  try {
    const matriculas = await Matricula.listarMatriculas();
    res.json(matriculas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar matrículas" });
  }
};

exports.obtenerMatriculaPorId = async (req, res) => {
  try {
    const data = await Matricula.obtenerMatriculaCompleta(req.params.id); // CAMBIAR AQUÍ
    if (!data) return res.status(404).json({ error: "Matrícula no encontrada" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener matrícula" });
  }
}; // AGREGAR PUNTO Y COMA

exports.actualizarMatricula = async (req, res) => {
  try {
    const { id } = req.params;
    const { estudiante, responsables, matricula } = req.body;
    
    // Actualizar estudiante
    await Matricula.actualizarEstudiante(estudiante.id, estudiante);
    
    // Actualizar responsables existentes
    const datosCompletos = await Matricula.obtenerMatriculaCompleta(id);
    const responsablesExistentes = datosCompletos.responsables;
    
    // Actualizar cada responsable
    for (const respData of responsables) { // CAMBIAR forEach por for...of
      const existente = responsablesExistentes.find(r => r.tipo_vinculo === respData.tipo_vinculo);
      if (existente) {
        await Matricula.actualizarResponsable(existente.id_responsable_legal, respData);
      }
    }
    
    // Actualizar matrícula
    const actualizado = await Matricula.actualizarMatricula(id, matricula);
    
    if (actualizado) {
      res.json({ message: "Matrícula actualizada correctamente" });
    } else {
      res.status(404).json({ error: "Matrícula no encontrada" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar matrícula" });
  }
};
