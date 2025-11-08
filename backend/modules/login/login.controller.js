const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const LoginModel = require('./login.model');

function signToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const expiresIn = process.env.JWT_EXPIRES || '8h';
  return jwt.sign(payload, secret, { expiresIn });
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Credenciales requeridas' });

    const user = await LoginModel.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Usuario o contraseña inválidos' });

    const ok = await bcrypt.compare(password, user.contrasenia);
    if (!ok) return res.status(401).json({ error: 'Usuario o contraseña inválidos' });

    if (user.estado_us && String(user.estado_us).toLowerCase() !== 'activo') {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    const token = signToken({
      sub: user.id_usuarios,
      pid: user.personal_id,
      role: user.roll,
      username: user.nombre_usuario
    });

    return res.json({
      token,
      user: {
        id: user.id_usuarios,
        username: user.nombre_usuario,
        role: user.roll,
        estado_us: user.estado_us,
        personal: {
          id: user.personal_id,
          nombre_per: user.nombre_per,
          apellido: user.apellido,
          cargo_per: user.cargo_per,
          estado_per: user.estado_per
        }
      }
    });
  } catch (err) { next(err); }
}

module.exports = { login };