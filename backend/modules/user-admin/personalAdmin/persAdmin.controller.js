const persAdminModel = require('./persAdmin.model')
const bcrypt = require('bcrypt');

async function registrarUsuario(req, res) {
    try {
        const { nombre, apellido, dni, cargo, nombre_usuario, contrasenia, roll, estado } = req.body;

        if (!nombre || !apellido || !dni || !roll) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const personalId = await persAdminModel.crearPersonal({
            txtnombre_per: nombre,
            txtapellido: apellido,
            txtcargo_per: cargo,
            txtdni: dni
        });

        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        const usuarioId = await persAdminModel.crearUsuario({
            txtpersonal_adm_id_personal_adm: personalId,
            txtnombre_usuario: nombre_usuario,
            txtcontrasenia: hashedPassword,
            txtroll: roll,
            txtestado_us: estado
        });

        res.status(201).json({
            message: 'Usuario registrado correctamente',
            personalId: personalId,
            usuarioId: usuarioId
        });
    } catch (error) {
        console.error('❌ Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function mostrarPersonal(req, res) {
    try {
        const { search } = req.query;
        const data = await persAdminModel.listarPersonalConUsuario({ search });
        res.json({ total: data.length, data });
    } catch (error) {
        console.error('❌ Error al mostrar persona:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }

}

async function mostrarPersonalPorId(req, res) {
    try {
        const { id } = req.params;
        const item = await persAdminModel.obtenerPersonalConUsuarioPorId(id);
        if (!item) return res.status(404).json({ error: 'Personal no encontrado' });
        res.json(item);
    } catch (error) {
        console.error('❌ Error al obtener personal:', error);
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}


async function eliminarUsuarioYPersonal(req, res) {
    try {
        const { id } = req.params;
        // 1. Busca eñ usuario para obtener el id deñ personal asociado
        const personal = await persAdminModel.obtenerPersonalConUsuarioPorId(id);
        if (!personal || !personal.usuario) {
            return res.status(404).json({ error: 'Personal o usuario no encontrado' });
        }
        // 2. Elimina el usuario
        const usuarioEliminado = await persAdminModel.eliminarUsuarioPorId(personal.usuario.usuario_id)
        // 3. Elimina el personal
        const personalEliminado = await persAdminModel.eliminarPersonalPorId(personal.personal_id)

        if (usuarioEliminado && personalEliminado) {
            res.json({ message: 'Usuario y personal eliminados correctamente' });
        } else {
            res.status(500).json({ error: 'Error al eliminar usuario o personal' });
        }
    } catch (error) {
        console.error('❌ Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function actualizarUsuarioYPersonal(req, res) {
    try {
        const usuario_id = req.params.id;
        // Busca el usuario y obtiene el personal_id asociado
        const usuarioData = await persAdminModel.obtenerUsuarioYPersonalPorUsuarioId(usuario_id);
        if (!usuarioData) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const personal_id = usuarioData.personal_id;

        const { nombre_per, apellido, cargo_per, dni, nombre_usuario, roll, estado_us } = req.body;

        if (
            !nombre_per || !apellido || !cargo_per || !dni ||
            !nombre_usuario || !roll || !estado_us
        ) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        // Actualizar personal
        const actualizadoPersonal = await persAdminModel.actualizarPersonal({
            id: personal_id,
            nombre_per,
            apellido,
            cargo_per,
            dni
        });

        // Actualizar usuario
        const actualizadoUsuario = await persAdminModel.actualizarUsuario({
            id: usuario_id,
            nombre_usuario,
            roll,
            estado_us
        });

        if (actualizadoPersonal && actualizadoUsuario) {
            res.json({ message: 'Datos actualizados correctamente' });
        } else {
            res.status(404).json({ error: 'No se pudo actualizar usuario o personal' });
        }
    } catch (error) {
        console.error('❌ Error al editar usuario y personal:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
module.exports = {
    registrarUsuario,
    mostrarPersonal,
    mostrarPersonalPorId,
    eliminarUsuarioYPersonal,
    actualizarUsuarioYPersonal
}