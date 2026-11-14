const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');
const authLimiter = require('./middleware/rateLimit');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const therapistRoutes = require('./routes/therapist');
const patientRoutes = require('./routes/patient');

const app = express();
const PORT = process.env.PORT || 5000;

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAnyOrigin = configuredOrigins.length === 0 && process.env.NODE_ENV !== 'production';
if (configuredOrigins.length === 0 && process.env.NODE_ENV === 'production') {
  console.warn('CORS_ORIGIN belum diatur di production. Browser client akan diblokir.');
}

app.use(cors({
  origin(origin, callback) {
    // Mobile apps and server-to-server calls do not send an Origin header.
    if (!origin) return callback(null, true);
    if (allowAnyOrigin || configuredOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
}));
app.use(express.json());

// Attach prisma to app for route access
app.set('prisma', prisma);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/patient/sessions', sessionRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/therapist', therapistRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function shutdown() {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
