const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const therapistRoutes = require('./routes/therapist');
const patientRoutes = require('./routes/patient');
const assessmentRoutes = require('./routes/assessments');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Attach prisma to app for route access
app.set('prisma', prisma);

app.use('/api/auth', authRoutes);
app.use('/api/patient/sessions', sessionRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/patient/assessments', assessmentRoutes);
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
