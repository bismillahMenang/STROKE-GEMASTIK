require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Therapist = require('../models/Therapist');
const Session = require('../models/Session');
const TherapistNote = require('../models/TherapistNote');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clean up previous test data
  await Patient.deleteMany({ email: /test-/ });
  await Therapist.deleteMany({ email: /test-/ });
  await Session.deleteMany({ notes: /test-/ });
  await TherapistNote.deleteMany({ note: /test-/ });

  const therapist = await Therapist.create({
    name: 'Test Therapist',
    email: 'test-therapist@example.com',
    passwordHash: 'hashed-password',
    licenseNumber: 'TEST-123',
    clinic: 'Test Clinic',
  });
  console.log('Therapist created:', therapist._id.toString());

  const patient = await Patient.create({
    name: 'Test Patient',
    email: 'test-patient@example.com',
    passwordHash: 'hashed-password',
    phone: '08123456789',
    diagnosis: 'Test diagnosis',
    assignedTherapistId: therapist._id,
  });
  console.log('Patient created:', patient._id.toString());

  const session = await Session.create({
    patientId: patient._id,
    date: new Date(),
    exercise: 'forearm_supination',
    peakRom: 62.5,
    avgRom: 45.2,
    repsCompleted: 10,
    consistency: 'high',
    notes: 'test session note',
    gyroRawSampleCount: 100,
  });
  console.log('Session created:', session._id.toString());

  const note = await TherapistNote.create({
    therapistId: therapist._id,
    patientId: patient._id,
    weekNumber: 1,
    note: 'test weekly note',
  });
  console.log('TherapistNote created:', note._id.toString());

  // Read back
  const foundPatient = await Patient.findById(patient._id);
  const foundTherapist = await Therapist.findById(therapist._id);
  const foundSession = await Session.findById(session._id);
  const foundNote = await TherapistNote.findById(note._id);

  console.log('Read back patient:', foundPatient.email);
  console.log('Read back therapist:', foundTherapist.email);
  console.log('Read back session:', foundSession.exercise);
  console.log('Read back note:', foundNote.note);

  await mongoose.disconnect();
  console.log('Verification complete');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
