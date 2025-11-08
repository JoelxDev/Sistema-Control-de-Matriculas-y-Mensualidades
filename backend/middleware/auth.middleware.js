const jwt = require('jsonwebtoken');

// Verifica Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const [scheme, token] = hdr.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { requireAuth };