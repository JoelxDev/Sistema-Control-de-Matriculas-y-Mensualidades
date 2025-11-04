const db = require('../../config/db');
const bcrypt = require('bcryptjs'); 

const PersAdminModel = {
  async listAll() {
    const sql = `
      SELECT
        p.id_personal_adm AS personal_id,
        p.nombre_per,
        p.apellido,
        p.cargo_per,
        p.dni,
        p.telefono_per,
        p.correo_elec_per,
        p.estado_per,
        p.fecha_creacion_per,
        u.id_usuarios AS usuario_id,
        u.nombre_usuario,
        u.roll,
        u.estado_us,
        u.personal_adm_id_personal_adm
      FROM personal_adm p
      LEFT JOIN usuarios u ON u.personal_adm_id_personal_adm = p.id_personal_adm
      ORDER BY p.apellido, p.nombre_per
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  async createPersonalWithUser({
    nombre_per,
    apellido,
    cargo_per,
    dni,
    telefono_per = null,
    correo_elec_per = null,
    estado_per = 'activo',
    nombre_usuario,
    contrasenia,
    roll,
    estado_us // opcional; si no viene, se toma estado_per
  }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [resP] = await conn.query(
        `INSERT INTO personal_adm
         (nombre_per, apellido, cargo_per, dni, telefono_per, correo_elec_per, fecha_creacion_per,estado_per)
         VALUES (?,?,?,?,?,?,NOW(),?)`,
        [nombre_per, apellido, cargo_per, dni, telefono_per, correo_elec_per, estado_per]
      );
      const personalId = resP.insertId;

      // Hash de contraseña (si no viene ya hasheada)
      let passwordToStore = String(contrasenia || dni || '');
      const isBcrypt = /^\$2[aby]?\$\d{2}\$/.test(passwordToStore);
      if (!isBcrypt) {
        const saltRounds = 10;
        passwordToStore = await bcrypt.hash(passwordToStore, saltRounds);
      }

      const [resU] = await conn.query(
        `INSERT INTO usuarios
         (nombre_usuario, contrasenia, roll, estado_us, personal_adm_id_personal_adm, fecha_creacion_us)
         VALUES (?,?,?,?,?,NOW())`,
        [nombre_usuario, passwordToStore, roll, (estado_us ?? estado_per), personalId]
      );
      

      await conn.commit();
      return { personalId, usuarioId: resU.insertId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async getByPersonalId(personalId) {
    const sql = `
      SELECT
        p.id_personal_adm AS personal_id,
        p.nombre_per,
        p.apellido,
        p.cargo_per,
        p.dni,
        p.telefono_per,
        p.correo_elec_per,
        p.estado_per,
        u.id_usuarios AS usuario_id,
        u.nombre_usuario,
        u.roll,
        u.estado_us,
        u.personal_adm_id_personal_adm
      FROM personal_adm p
      LEFT JOIN usuarios u ON u.personal_adm_id_personal_adm = p.id_personal_adm
      WHERE p.id_personal_adm = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [personalId]);
    return rows[0] || null;
  },

  async getUserById(usuarioId) {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE id_usuarios = ? LIMIT 1',
      [usuarioId]
    );
    return rows[0] || null;
  },

  // Actualiza SOLO personal_adm
  async updatePersonalById(personalId, {
    nombre_per = '',
    apellido = '',
    cargo_per = '',
    dni = '',
    telefono_per = null,
    correo_elec_per = null,
    estado_per = null
  }) {
    const sql = `
      UPDATE personal_adm
      SET nombre_per = ?, apellido = ?, cargo_per = ?, dni = ?,
          telefono_per = ?, correo_elec_per = ?, estado_per = COALESCE(?, estado_per)
      WHERE id_personal_adm = ?
    `;
    const params = [nombre_per, apellido, cargo_per, dni, telefono_per, correo_elec_per, estado_per, personalId];
    const [res] = await db.query(sql, params);
    return res;
  },

  // Actualiza SOLO roll y estado_us en usuarios vinculados (si vienen)
  async updateUsuariosRollEstadoByPersonalId(personalId, { roll = null, estado_us = null }) {
    const sql = `
      UPDATE usuarios
      SET roll = COALESCE(?, roll),
          estado_us = COALESCE(?, estado_us)
      WHERE personal_adm_id_personal_adm = ?
    `;
    const [res] = await db.query(sql, [roll, estado_us, personalId]);
    return res;
  },

  async deleteByPersonalId(personalId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM usuarios WHERE personal_adm_id_personal_adm = ?', [personalId]);
      const [res] = await conn.query('DELETE FROM personal_adm WHERE id_personal_adm = ?', [personalId]);
      await conn.commit();
      return res.affectedRows;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
};

module.exports = PersAdminModel;