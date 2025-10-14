// ...existing code...
const db = require('../../../config/db'); // Ajusta la ruta según tu configuración

class MensualidadModel {
    // helper para unificar resultados de db.query (mysql2 -> [rows, fields], mysql -> rows)
    static _unwrap(result) {
        if (Array.isArray(result)) {
            // mysql2 promise: [rows, fields] -> devolvemos rows (o okPacket en inserts/updates)
            return result[0];
        }
        // algunos wrappers devuelven { rows }
        if (result && Array.isArray(result.rows)) return result.rows;
        return result;
    }
    static async obtenerPorMes(mesLower) {
        const query = 'SELECT * FROM mensualidades WHERE LOWER(mes) = ? LIMIT 1';
        const result = await db.query(query, [mesLower]);
        const rows = MensualidadModel._unwrap(result);
        if (Array.isArray(rows)) return rows[0] || null;
        return null;
    }

    // Crear nueva mensualidad
    static async crear(datos) {
        const { mes, fecha_limite, descripcion_mes } = datos;
        const query = `
            INSERT INTO mensualidades (mes, fecha_limite, fecha_creacion_mes, descripcion_mes) 
            VALUES (?, ?, NOW(), ?)
        `;
        const result = await db.query(query, [mes, fecha_limite, descripcion_mes]);
        return MensualidadModel._unwrap(result); // okPacket con insertId para mysql2
    }

    // Obtener todas las mensualidades
    static async obtenerTodas() {
        const query = 'SELECT * FROM mensualidades ORDER BY id_mes DESC';
        const result = await db.query(query);
        return MensualidadModel._unwrap(result);
    }

    // Obtener mensualidad por ID
    static async obtenerPorId(id) {
        const query = 'SELECT * FROM mensualidades WHERE id_mes = ?';
        const result = await db.query(query, [id]);
        const rows = MensualidadModel._unwrap(result);
        if (Array.isArray(rows)) return rows[0] || null;
        return null;
    }

    // Verificar si ya existe un mes
    static async existeMes(mes, idExcluir = null) {
        try {
            let query = 'SELECT id_mes FROM mensualidades WHERE LOWER(mes) = LOWER(?)';
            const params = [mes];
            
            if (idExcluir) {
                query += ' AND id_mes != ?';
                params.push(idExcluir);
            }

            const result = await db.query(query, params);
            const rows = MensualidadModel._unwrap(result);

            if (Array.isArray(rows)) {
                return rows.length > 0;
            }
            return false;
        } catch (error) {
            console.error('Error en existeMes:', error);
            throw error;
        }
    }

    // Actualizar mensualidad
    static async actualizar(id, datos) {
        const { mes, fecha_limite, descripcion_mes } = datos;
        const query = `
            UPDATE mensualidades 
            SET mes = ?, fecha_limite = ?, descripcion_mes = ? 
            WHERE id_mes = ?
        `;
        const result = await db.query(query, [mes, fecha_limite, descripcion_mes, id]);
        return MensualidadModel._unwrap(result);
    }

    // Eliminar mensualidad
    static async eliminar(id) {
        const query = 'DELETE FROM mensualidades WHERE id_mes = ?';
        const result = await db.query(query, [id]);
        return MensualidadModel._unwrap(result);
    }
}

module.exports = MensualidadModel;
// ...existing code...