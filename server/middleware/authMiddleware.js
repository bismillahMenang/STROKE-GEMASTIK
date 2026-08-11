const jwt = require('jsonwebtoken');

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: true, message: 'Sesi berakhir, silakan masuk kembali' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: true, message: 'Forbidden' });
      }

      req.user = { id: decoded.id, role: decoded.role };
      next();
    } catch (err) {
      console.error('Auth middleware error:', err.message);
      return res.status(401).json({ error: true, message: 'Sesi berakhir, silakan masuk kembali' });
    }
  };
}

module.exports = authMiddleware;
