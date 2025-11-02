const db = require("../../config/db");

const Descuento = { 
    async crearDescuento({nombre_desc, porcentaje_desc, descripcion_desc}) {
        const [result] = await db.execute(
            "INSERT INTO descuentos (nombre_desc, porcentaje_desc, descripcion_desc) VALUES (?, ?, ?)",
            [nombre_desc, porcentaje_desc, descripcion_desc]
        );
        return { id: result.insertId };
    },
    async listarDescuentos() {
        const [rows] = await db.execute(
            "SELECT * FROM descuentos"
        );
        return rows;
    },
    async obtenerDescuentoPorId(id) {
        const [rows] = await db.execute(
            "SELECT * FROM descuentos WHERE id_descuento = ?", [id]
        );
        return rows[0] || null;
    },
    async editarDescuento({id, nombre_desc, porcentaje_desc, descripcion_desc}) {
        const [result] = await db.execute(
            "UPDATE descuentos SET nombre_desc = ?, porcentaje_desc = ?, descripcion_desc = ? WHERE id_descuento = ?",
            [nombre_desc, porcentaje_desc, descripcion_desc, id]
        );
        return result.affectedRows > 0;
    },
    async eliminarDescuento(id) {
        const [result] = await db.execute(
            "DELETE FROM descuentos WHERE id_descuento = ?",
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Descuento;
