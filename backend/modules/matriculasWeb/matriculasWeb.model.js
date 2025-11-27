const db = require('../../config/db');

class MatriculaWebModel {
    static _unwrap(result) {
        if (Array.isArray(result)) {
            return result[0] || result;
        }
        if (result && Array.isArray(result.rows)) {
            return result.rows;
        }
        return result;
    }

    static async crear(datos) {
        const {
            nombre_estudiante,
            apellido_estudiante,
            dni_estudiante,
            fecha_nacimiento,
            genero,
            nombre_padre,
            dni_padre,
            nombre_madre,
            dni_madre,
            ubicacion,
            nivel,
            grado
        } = datos;

        const query = `
            INSERT INTO matriculas_web (
                nombre_estudiante,
                apellido_estudiante,
                dni_estudiante,
                fecha_nacimiento,
                genero,
                nombre_padre,
                dni_padre,
                nombre_madre,
                dni_madre,
                ubicacion,
                nivel,
                grado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.query(query, [
            nombre_estudiante,
            apellido_estudiante,
            dni_estudiante,
            fecha_nacimiento,
            genero,
            nombre_padre,
            dni_padre,
            nombre_madre,
            dni_madre,
            ubicacion,
            nivel,
            grado
        ]);

        return MatriculaWebModel._unwrap(result);
    }

    static async obtenerTodas() {
        const query = 'SELECT * FROM matriculas_web ORDER BY matricula_web DESC';
        const result = await db.query(query);
        return MatriculaWebModel._unwrap(result);
    }

    static async obtenerPorId(id) {
        const query = 'SELECT * FROM matriculas_web WHERE matricula_web = ?';
        const result = await db.query(query, [id]);
        const rows = MatriculaWebModel._unwrap(result);
        if (Array.isArray(rows)) {
            return rows[0] || null;
        }
        return null;
    }

    static async verificarDniExistente(dni) {
        const query = 'SELECT COUNT(*) as count FROM matriculas_web WHERE dni_estudiante = ?';
        const result = await db.query(query, [dni]);
        const rows = MatriculaWebModel._unwrap(result);
        return rows[0].count > 0;
    }
}

module.exports = MatriculaWebModel;