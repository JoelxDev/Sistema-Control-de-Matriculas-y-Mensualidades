const persAdminModel = require('./persAdmin.model')
const bcrypt = require('bcrypt');

async function registrarUsuario(req, res){
    try{
        const {nombre, apellido, dni, cargo, nombredelusuario, contrasenia, roll, estado} = req.body;

        if (!nombre || !apellido || !dni || !roll) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const personalId = await persAdminModel.crearPersonal({nombre, apellido, cargo, dni});

        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        await persAdminModel.crearUsuario({
            personal_adm_id_personal_adm: personalId, 
            nombre_usuario: nombredelusuario, 
            contrasenia: hashedPassword, roll
        });

        res.status(201).json({message: 'Usuario registrado correctamente'});
    }catch (error){
        console.error('❌ Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    registrarUsuario
};