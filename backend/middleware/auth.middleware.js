const jwt = require('jsonwebtoken');

function extractToken(req) {
  // 1. Cookie
  if (req.cookies?.auth_token) return req.cookies.auth_token;
  // 2. Authorization
  const hdr = req.headers.authorization || '';
  const [scheme, token] = hdr.split(' ');
  if (scheme === 'Bearer' && token) return token;
  return null;
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.verify(token, secret);
}

function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function requireAuthView(req, res, next) {
  const token = extractToken(req) || req.query.token;
  if (!token) return res.redirect('http://localhost:8088/?error=no_auth');
  try {
    req.user = verifyToken(token);
    // Si vino en query, escribir cookie (para primera carga desde link externo)
    if (req.query.token) {
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000,
        path: '/'
      });
    }
    next();
  } catch {
    return res.redirect('http://localhost:8088/?error=invalid_token');
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !String(req.user.role).toLowerCase().includes('admin'))
    return res.status(403).send('Acceso denegado');
  next();
}

function requireSecretario(req, res, next) {
  if (!req.user || !String(req.user.role).toLowerCase().includes('secret'))
    return res.status(403).send('Acceso denegado');
  next();
}

module.exports = { requireAuth, requireAuthView, requireAdmin, requireSecretario };