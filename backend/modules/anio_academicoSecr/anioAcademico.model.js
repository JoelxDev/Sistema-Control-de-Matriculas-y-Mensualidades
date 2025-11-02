const db = require("../../config/db")

const anioAcademicoSecr = {

    async crearAnioAcademico({ anio_acad, fecha_inicio_anio, fecha_fin_anio, descripcion_anio, estado }) {
        const [result] = await db.execute(
            "INSERT INTO anio_academico(anio_acad, fecha_inicio_anio, fecha_fin_anio, descripcion_anio, estado) VALUES (?,?,?,?,?)",
            [anio_acad, fecha_inicio_anio, fecha_fin_anio, descripcion_anio, estado]
        );
        return {id: result.insertId};
    },
    async listarAnioAcademico({ search } = {}) {
    if (search) {
        const [rows] = await db.execute(
            "SELECT * FROM anio_academico WHERE anio_acad LIKE ?",
            [`%${search}%`]
        );
        return rows;
    } else {
        const [rows] = await db.execute("SELECT * FROM anio_academico");
        return rows;
    }
    },
    async obtenerAnioAcademicoPorId(id) {
    const [rows] = await db.execute(
        "SELECT * FROM anio_academico WHERE id_anio_escolar = ?",
        [id]
    );
    return rows[0];
    },
    async editarAnioAcademico({ id, anio_acad, fecha_inicio_anio, fecha_fin_anio, descripcion_anio, estado }) {
        const [result] = await db.execute(
            "UPDATE anio_academico SET anio_acad = ?, fecha_inicio_anio = ?, fecha_fin_anio = ?, descripcion_anio = ?, estado = ? WHERE id_anio_escolar = ?",
            [anio_acad, fecha_inicio_anio, fecha_fin_anio, descripcion_anio, estado, id]
        );
        return result.affectedRows > 0;
    },
    async eliminarAnioAcademico(id) {
        const [result] = await db.execute(
            "DELETE FROM anio_academico WHERE id_anio_escolar = ?",
            [id]
        );
        return result.affectedRows > 0;
    }
};
module.exports = anioAcademicoSecr;