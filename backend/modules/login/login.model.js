const db = require('../../config/db');

async function findByUsername(username) {
  const sql = `
    SELECT 
      u.id_usuarios, u.nombre_usuario, u.contrasenia, u.roll, u.estado_us,
      u.personal_adm_id_personal_adm AS personal_id,
      p.nombre_per, p.apellido, p.cargo_per, p.estado_per, p.telefono_per
    FROM usuarios u
    LEFT JOIN personal_adm p ON p.id_personal_adm = u.personal_adm_id_personal_adm
    WHERE u.nombre_usuario = ?
    LIMIT 1`;
  const [rows] = await db.query(sql, [username]);
  return rows[0] || null;
}

module.exports = { findByUsername };