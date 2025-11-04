const PersModel = require('./persAdmin.model');

const PersAdminController = {
  async listPersonal(req, res, next) {
    try {
      const rows = await PersModel.listAll();
      return res.json({ total: rows.length, data: rows.map(r => ({
        personal_id: r.personal_id,
        nombre_per: r.nombre_per,
        apellido: r.apellido,
        cargo_per: r.cargo_per,
        dni: r.dni,
        telefono_per: r.telefono_per,
        correo_elec_per: r.correo_elec_per,
        fecha_creacion_per: r.fecha_creacion_per,
        estado_per: r.estado_per,
        usuario: r.usuario_id ? {
          usuario_id: r.usuario_id,
          nombre_usuario: r.nombre_usuario,
          roll: r.roll,
          estado_us: r.estado_us
        } : null
      })) });
    } catch (err) { next(err); }
  },

  async createPersonal(req, res, next) {
    try {
      const b = req.body || {};
      const nombre_per = b.nombre_per ?? b.nombre ?? '';
      const apellido = b.apellido ?? '';
      const cargo_per = b.cargo_per ?? b.cargo ?? '';
      const dni = b.dni ?? '';
      const telefono_per = b.telefono_per ?? b.telefono ?? null;
      const correo_elec_per = b.correo_elec_per ?? b.correo ?? b.email ?? null;
      const estado_per = b.estado_per ?? b.estado ?? 'activo';

      if (!nombre_per || !apellido) {
        return res.status(400).json({ error: 'Faltan datos: nombre y/o apellido' });
      }

      // Generar username/roll por defecto
      const nombre_usuario = (b.nombre_usuario
        ?? ((nombre_per.split(' ')[0] || '') + (apellido.split(' ')[0] || '')).toLowerCase());
      const contrasenia = b.contrasenia ?? dni;
      let roll = b.roll;
      if (!roll) {
        const cargoLow = String(cargo_per).toLowerCase();
        roll = cargoLow.includes('admin') ? 'administrador'
             : cargoLow.includes('secretaria') ? 'secretaria'
             : 'otro';
      }

      const out = await PersModel.createPersonalWithUser({
        nombre_per, apellido, cargo_per, dni, telefono_per, correo_elec_per, estado_per,
        nombre_usuario, contrasenia, roll
      });
      return res.status(201).json({ message: 'Creado', personalId: out.personalId, usuarioId: out.usuarioId });
    } catch (err) { next(err); }
  },

  async getPersonalById(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: 'ID inválido' });
      const row = await PersModel.getByPersonalId(id);
      if (!row) return res.status(404).json({ error: 'No encontrado' });

      const usuario = row.usuario_id ? {
        usuario_id: row.usuario_id,
        nombre_usuario: row.nombre_usuario,
        roll: row.roll,
        estado_us: row.estado_us
      } : null;

      return res.json({
        personal_id: row.personal_id,
        nombre_per: row.nombre_per,
        apellido: row.apellido,
        cargo_per: row.cargo_per,
        dni: row.dni,
        telefono_per: row.telefono_per,
        correo_elec_per: row.correo_elec_per,
        estado_per: row.estado_per,
        usuario
      });
    } catch (err) { next(err); }
  },

  // PUT /api/admin/usuarios/usuarios-personal/:id  -> :id puede ser usuarioId o personalId
  async updateByUsuarioId(req, res, next) {
    try {
      const idParam = Number(req.params.id);
      if (!idParam) return res.status(400).json({ error: 'ID inválido' });

      const b = req.body || {};
      const payloadPersonal = {
        nombre_per: b.nombre_per ?? b.nombre ?? '',
        apellido: b.apellido ?? '',
        cargo_per: b.cargo_per ?? b.cargo ?? '',
        dni: b.dni ?? '',
        telefono_per: b.telefono_per ?? b.telefono ?? null,
        correo_elec_per: b.correo_elec_per ?? b.correo ?? b.email ?? null,
        estado_per: b.estado_per ?? null
      };

      // Resolver personalId desde usuarioId si aplica
      let personalId = idParam;
      const maybeUser = await PersModel.getUserById(idParam);
      if (maybeUser && maybeUser.personal_adm_id_personal_adm) {
        personalId = maybeUser.personal_adm_id_personal_adm;
      } else {
        const existsPersonal = await PersModel.getByPersonalId(idParam);
        if (!existsPersonal) return res.status(404).json({ error: 'No encontrado' });
      }

      // 1) Actualizar personal_adm
      await PersModel.updatePersonalById(personalId, payloadPersonal);

      // 2) Si cambian cargo_per o estado_per -> sincronizar usuarios (roll/estado_us)
      const roll = payloadPersonal.cargo_per || null;
      const estado_us = (payloadPersonal.estado_per ?? null);
      if (roll !== null || estado_us !== null) {
        await PersModel.updateUsuariosRollEstadoByPersonalId(personalId, { roll, estado_us });
      }

      return res.json({ message: 'Actualizado' });
    } catch (err) { next(err); }
  },

  async deleteByPersonalId(req, res, next) {
    try {
      const personalId = Number(req.params.id);
      if (!personalId) return res.status(400).json({ error: 'ID inválido' });
      const affected = await PersModel.deleteByPersonalId(personalId);
      return res.json({ message: 'Eliminado', affected });
    } catch (err) { next(err); }
  }
};

module.exports = PersAdminController;