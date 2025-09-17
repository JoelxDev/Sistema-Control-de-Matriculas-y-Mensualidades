const db = require("../../../config/db");

const Aula = {
    async crearAula({ capacidad_maxima, estado }) {
        const [result] = await db.execute(
            "INSERT INTO aulas (capacidad_maxima, estado) VALUES (?, ?)",
            [capacidad_maxima, estado]
        );
        return result.insertId;
    },

    async listarAulas() {
        const [rows] = await db.execute("SELECT * FROM aulas");
        return rows;
    },

    async obtenerAulaPorId(id) {
        const [rows] = await db.execute("SELECT * FROM aulas WHERE id_aula = ?", [id]);
        return rows[0] || null;
    },

    async actualizarAula({ id_aula, capacidad_maxima, estado }) {
        const [result] = await db.execute(
            "UPDATE aulas SET capacidad_maxima = ?, estado = ? WHERE id_aula = ?",
            [capacidad_maxima, estado, id_aula]
        );
        return result.affectedRows > 0;
    },

    async eliminarAula(id_aula) {
        const [result] = await db.execute(
            "DELETE FROM aulas WHERE id_aula = ?",
            [id_aula]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Aula;