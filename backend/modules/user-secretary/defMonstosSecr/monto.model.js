const db = require("../../../config/db");

const Monto = {
    // Listar todos los montos (matrícula y mensualidad)
    async listarTodos() {
        const [rows] = await db.execute(`
            SELECT em.*, g.nombre_grad as grado_nombre, n.nombre_niv as nivel_nombre
            FROM estimar_monto em
            LEFT JOIN grados g ON em.grados_id_grado = g.id_grado
            LEFT JOIN niveles n ON g.niveles_id_nivel = n.id_nivel
            ORDER BY em.tipo_est_mon, em.grados_id_grado
        `);
        return rows;
    },

    // Listar por tipo (matricula o mensualidad)
    async listarPorTipo(tipo) {
        const [rows] = await db.execute(`
            SELECT em.*, g.nombre_grad as grado_nombre
            FROM estimar_monto em
            LEFT JOIN grados g ON em.grados_id_grado = g.id_grado
            WHERE em.tipo_est_mon = ?
            ORDER BY em.grados_id_grado
        `, [tipo]);
        return rows;
    },

    // Obtener monto por tipo y grado
    async obtenerPorTipoYGrado(tipo, gradoId) {
        const [rows] = await db.execute(`
            SELECT em.*, g.nombre_grad as grado_nombre
            FROM estimar_monto em
            LEFT JOIN grados g ON em.grados_id_grado = g.id_grado
            WHERE em.tipo_est_mon = ? AND em.grados_id_grado = ?
            LIMIT 1
        `, [tipo, gradoId]);
        return rows[0] || null;
    },

    async obtenerPorId(id) {
    const [rows] = await db.execute(`
        SELECT em.*, g.nombre_grad as grado_nombre
        FROM estimar_monto em
        LEFT JOIN grados g ON em.grados_id_grado = g.id_grado
        WHERE em.id_estimar_monto = ?
        LIMIT 1
    `, [id]);
    return rows[0] || null;
},
    // Crear monto
    async crear(datos) {
        const [result] = await db.execute(`
            INSERT INTO estimar_monto (tipo_est_mon, monto_base, descripcion, grados_id_grado)
            VALUES (?, ?, ?, ?)
        `, [
            datos.tipo_est_mon,
            datos.monto_base,
            datos.descripcion,
            datos.grados_id_grado || null
        ]);
        return result;
    },

    // Actualizar monto
    async actualizar(id, datos) {
        const [result] = await db.execute(`
            UPDATE estimar_monto
            SET tipo_est_mon = ?, monto_base = ?, descripcion = ?, grados_id_grado = ?
            WHERE id_estimar_monto = ?
        `, [
            datos.tipo_est_mon,
            datos.monto_base,
            datos.descripcion,
            datos.grados_id_grado || null,
            id
        ]);
        return result.affectedRows > 0;
    },

    // Eliminar monto
    async eliminar(id) {
        const [result] = await db.execute(`
            DELETE FROM estimar_monto WHERE id_estimar_monto = ?
        `, [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Monto;