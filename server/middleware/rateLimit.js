const rateLimit = require('express-rate-limit');

// Limits credential endpoints per IP. Configurable so tests and local
// development can relax the limit without changing code.
const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
  },
});

module.exports = authLimiter;
