const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const Patient = require('./models/Patient');
const Therapist = require('./models/Therapist');
const Session = require('./models/Session');
const TherapistNote = require('./models/TherapistNote');

const demoPatients = [
  { name: 'Budi Demo', email: 'budi.demo@example.com', phone: '080000000001', diagnosis: 'Kelemahan lengan kanan, contoh data' },
  { name: 'Dewi Demo', email: 'dewi.demo@example.com', phone: '080000000002', diagnosis: 'Pemulihan bahu, contoh data' },
  { name: 'Raka Demo', email: 'raka.demo@example.com', phone: '080000000003', diagnosis: 'Pemulihan siku, contoh data' },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await bcrypt.hash('demo-password-123', 10);
  const therapist = await Therapist.findOneAndUpdate(
    { email: 'terapis.demo@example.com' },
    { name: 'Terapis Demo', email: 'terapis.demo@example.com', passwordHash, clinic: 'Klinik Contoh PulihTrack' },
    { upsert: true, new: true }
  );

  const patients = [];
  for (const data of demoPatients) {
    const patient = await Patient.findOneAndUpdate(
      { email: data.email },
      { ...data, passwordHash, assignedTherapistId: therapist._id },
      { upsert: true, new: true }
    );
    patients.push(patient);
  }

  therapist.patientIds = patients.map((patient) => patient._id);
  await therapist.save();
  await Session.deleteMany({ patientId: { $in: patients.map((patient) => patient._id) } });
  await TherapistNote.deleteMany({ therapistId: therapist._id });

  const exercises = [
    ['forearm_supination', 80],
    ['shoulder_abduction', 90],
    ['elbow_flexion', 150],
  ];
  const sessions = [];
  for (const [patientIndex, patient] of patients.entries()) {
    for (let week = 0; week < 8; week += 1) {
      for (const [exerciseIndex, [exercise, target]] of exercises.entries()) {
        const base = target * (0.55 + patientIndex * 0.04 + week * 0.025);
        const peakRom = Math.min(target, Math.round(base + exerciseIndex * 2));
        sessions.push({ patientId: patient._id, date: new Date(Date.now() - ((7 - week) * 7 + exerciseIndex) * 86400000), exercise, peakRom, avgRom: Math.round(peakRom * 0.72), repsCompleted: 10, consistency: week > 3 ? 'high' : 'medium', notes: week === 5 && patientIndex === 1 ? 'Bahu terasa lelah.' : '', gyroRawSampleCount: 100, syncedAt: new Date() });
      }
    }
  }
  await Session.insertMany(sessions);
  await TherapistNote.insertMany(patients.map((patient, index) => ({ therapistId: therapist._id, patientId: patient._id, weekNumber: 4, note: index === 1 ? 'Pantau kenyamanan bahu pada sesi berikutnya.' : 'Lanjutkan latihan rutin sesuai kemampuan.', })));
  await mongoose.disconnect();
  console.log('Demo seed complete: 1 therapist, 3 fictional patients, and 72 sessions.');
}

run().catch((error) => { console.error('Seed failed:', error); process.exit(1); });
