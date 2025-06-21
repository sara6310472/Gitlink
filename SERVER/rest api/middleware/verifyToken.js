const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET;

function verifyToken(req, res, next) {
  const openPaths = ['/login', '/register', '/logout', '/refresh'];
  if (openPaths.includes(req.path) || req.method == 'GET') return next();

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    if (decoded.ip !== req.ip) return res.status(403).json({ error: 'Token IP mismatch' });

    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
