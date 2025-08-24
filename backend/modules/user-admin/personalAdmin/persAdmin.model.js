const db = require("../../../config/db");

const PersonalAdmin = {
    async crearPersonal({ txtnombre_per, txtapellido, txtcargo_per, txtdni }) {
        const [result] = await db.execute(
            "INSERT INTO personal_adm(nombre_per, apellido, cargo_per, dni) VALUES(?,?,?,?)",
            [txtnombre_per, txtapellido, txtcargo_per, txtdni]
        );
        return result.insertId;
    },
    async crearUsuario({
        txtnombre_usuario,
        txtcontrasenia,
        txtroll,
        txtestado_us,
        txtpersonal_adm_id_personal_adm,
    }) {
        const [result] = await db.execute(
            "INSERT INTO usuarios (nombre_usuario, contrasenia, roll, estado_us, personal_adm_id_personal_adm) VALUES(?,?,?,?,?)",
            [
                txtnombre_usuario,
                txtcontrasenia,
                txtroll,
                txtestado_us,
                txtpersonal_adm_id_personal_adm,
            ]
        );
        return result.insertId;
    },

    async listarPersonalConUsuario({ search } = {}) {
        let sql = `SELECT p.id_personal_adm AS personal_id, p.nombre_per, p.apellido, p.cargo_per, p.dni, u.id_usuario AS usuario_id, u.nombre_usuario, u.roll, u.estado_us 
        FROM personal_adm p
        LEFT JOIN usuarios u
        ON u.personal_adm_id_personal_adm = p.id_personal_adm`;

        const params = [];

        if (search) {
            sql += `WHERE p.nombre_per LIKE ? OR p.apellido LIKE ? OR p.dni LIKE ? `;
            const like = `%${search}%`;
            params.push(like, like, like);
        }

        sql += ` ORDER BY p.id_personal_adm DESC`;

        const [rows] = await db.execute(sql, params);

        // MAPEO PARA ANIDAT EL USUARIO Y NUNCA EXPONER LA CONTRASEÑA
        return rows.map((r) => ({
            personal_id: r.personal_id,
            nombre_per: r.nombre_per,
            apellido: r.apellido,
            cargo_per: r.cargo_per,
            dni: r.dni,
            usuario: r.usuario_id
                ? {
                    usuario_id: r.usuario_id,
                    nombre_usuario: r.nombre_usuario,
                    roll: r.roll,
                    estado_us: r.estado_us,
                }
                : null,
        }));
    },

    // 🔎 Obtener un personal (y su usuario) por ID
    async obtenerPersonalConUsuarioPorId(id) {
        const sql = `
    SELECT
        p.id_personal_adm       AS personal_id,
        p.nombre_per, p.apellido, p.cargo_per, p.dni,
        u.id_usuario            AS usuario_id,
        u.nombre_usuario, u.roll, u.estado_us
    FROM personal_adm p
    LEFT JOIN usuarios u
    ON u.personal_adm_id_personal_adm = p.id_personal_adm
    WHERE p.id_personal_adm = ?
    LIMIT 1
    `;
        const [rows] = await db.execute(sql, [id]);
        if (rows.length === 0) return null;

        const r = rows[0];
        return {
            personal_id: r.personal_id,
            nombre_per: r.nombre_per,
            apellido: r.apellido,
            cargo_per: r.cargo_per,
            dni: r.dni,
            usuario: r.usuario_id
                ? {
                    usuario_id: r.usuario_id,
                    nombre_usuario: r.nombre_usuario,
                    roll: r.roll,
                    estado_us: r.estado_us,
                }
                : null,
        };
    },

    async eliminarPersonalPorId(personal_id){
        const [result] = await db.execute(
            "DELETE FROM personal_adm WHERE id_personal_adm = ?",
            [personal_id]
        );
        return result.affectedRows > 0;
    },

    async eliminarUsuarioPorId(usuario_id){
        const[result] = await db.execute(
            "DELETE FROM usuarios WHERE id_usuario = ?",
            [usuario_id]
        );
        return result.affectedRows > 0;
    },

    async actualizarPersonal({id, nombre_per, apellido, cargo_per, dni}){
        const [result] = await db.execute(
            "UPDATE personal_adm SET nombre_per = ?, apellido = ?, cargo_per = ?, dni = ? WHERE id_personal_adm = ?",
            [nombre_per, apellido, cargo_per, dni, id]
        );
        return result.affectedRows > 0;
    },

    async actualizarUsuario({id, nombre_usuario, roll, estado_us}){
        const [result] = await db.execute(
            "UPDATE usuarios SET nombre_usuario = ?, roll = ?, estado_us = ? WHERE id_usuario = ?",
            [nombre_usuario, roll, estado_us, id]
        );
        return result.affectedRows > 0;
    },

        // Obtener usuario y personal por id de usuario
async obtenerUsuarioYPersonalPorUsuarioId(usuario_id) {
    const sql = `
        SELECT u.id_usuario, u.nombre_usuario, u.roll, u.estado_us, u.personal_adm_id_personal_adm AS personal_id
        FROM usuarios u
        WHERE u.id_usuario = ?
        LIMIT 1
    `;
    const [rows] = await db.execute(sql, [usuario_id]);
    if (rows.length === 0) return null;
    return rows[0];
}
};
module.exports = PersonalAdmin;
