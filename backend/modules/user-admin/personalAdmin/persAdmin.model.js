const db = require('../../../config/db');

const PersonalAdmin = {
    async crearPersonal({ nombre_per, apellido, cargo, dni}){
        const [result] = await db.execute(
            'INSERT INTO personal_admin(nombre_per, apellido, cargo, dni) VALUES(?,?,?,?)'
            [nombre_per, apellido, cargo, dni]
        );
        return result.insertId;
    },
    async crearUsuario({nombre_usuario, contrasenia, roll, estado_us, personal_adm_id_personal_adm}){
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre_usuario, contrasenia, roll, estado_us, personal_adm_id_personal_adm) VALUES(?,?,?,?,?)'
            [nombre_usuario, contrasenia, roll, estado_us, personal_adm_id_personal_adm]
        );
        return result.insertId;
    }
}
module.exports = PersonalAdmin;
