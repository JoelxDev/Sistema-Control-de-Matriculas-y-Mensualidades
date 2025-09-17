const anioAcademicoModel = require ('./anioAcademico.model');

async function crearAnioAcademico(req, res){
    try {
            const {anio_acad, fecha_inicio_anio,  fecha_fin_anio, descripcion_anio, estado} = req.body;
            if(!anio_acad || !fecha_inicio_anio || !fecha_fin_anio || !descripcion_anio || !estado){
                return res.status(400).json({error: 'Todos los campos son obligatorios'})
            }

            const nuevoAnioAcademico = await anioAcademicoModel.crearAnioAcademico({
                anio_acad,
                fecha_inicio_anio,
                fecha_fin_anio,
                descripcion_anio,
                estado
            });
            return res.status(201).json(nuevoAnioAcademico);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Error al crear el año académico'});
    }
}
async function listarAnioAcademico(req, res){
    try {
        const {search} = req.query;
        const aniosAcademicos = await anioAcademicoModel.listarAnioAcademico({search});
        return res.json(aniosAcademicos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Error al listar los años académicos'});
    }
}

async function obtenerAnioAcademicoPorId (req, res){
    try {
        const {id} = req.params;
        const anioAcademico = await anioAcademicoModel.obtenerAnioAcademicoPorId(id);
        if (!anioAcademico) {
            return res.status(404).json({error: 'Año académico no encontrado'});
        }
        return res.json(anioAcademico);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Error al obtener el año académico'});
    }
}
async function editarAnioAcademico(req, res){
    try {
        const {id} = req.params;
        const {anio_acad, fecha_inicio_anio, fecha_fin_anio, descripcion_anio, estado} = req.body;
        if(!anio_acad || !fecha_inicio_anio || !fecha_fin_anio || !descripcion_anio || !estado){
            return res.status(400).json({error: 'Todos los campos son obligatorios'});
        }
        const anioAcademico = await anioAcademicoModel.obtenerAnioAcademicoPorId(id);
        if (!anioAcademico) {
            return res.status(404).json({error: 'Año académico no encontrado'});
        }
        const anioAcademicoActualizado = await anioAcademicoModel.editarAnioAcademico({
            id,
            anio_acad,
            fecha_inicio_anio,
            fecha_fin_anio,
            descripcion_anio,
            estado
        });
        return res.json(anioAcademicoActualizado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Error al editar el año académico'});
    }
}
async function eliminarAnioAcademico(req, res){
    try {
        const {id} = req.params;
        const anioAcademico = await anioAcademicoModel.obtenerAnioAcademicoPorId(id);
        if (!anioAcademico) {
            return res.status(404).json({error: 'Año académico no encontrado'});
        }
        const eliminado = await anioAcademicoModel.eliminarAnioAcademico(id);
        if (!eliminado) {
            return res.status(500).json({error: 'Error al eliminar el año académico'});
        }
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Error al eliminar el año académico'});
    }
}

module.exports = {
    crearAnioAcademico,
    listarAnioAcademico,
    obtenerAnioAcademicoPorId,
    editarAnioAcademico,
    eliminarAnioAcademico
};