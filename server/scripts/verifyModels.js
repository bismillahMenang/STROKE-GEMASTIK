require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const prisma = require('../lib/prisma');

async function run() {
  console.log('Connected to PostgreSQL via Prisma');

  // Clean up previous test data
  await prisma.patient.deleteMany({ where: { email: { startsWith: 'test-' } } });
  await prisma.therapist.deleteMany({ where: { email: { startsWith: 'test-' } } });
  await prisma.session.deleteMany({ where: { notes: { startsWith: 'test ' } } });
  await prisma.therapistNote.deleteMany({ where: { note: { startsWith: 'test ' } } });

  const therapist = await prisma.therapist.create({
    data: {
      name: 'Test Therapist',
      email: 'test-therapist@example.com',
      passwordHash: 'hashed-password',
      licenseNumber: 'TEST-123',
      clinic: 'Test Clinic',
    },
  });
  console.log('Therapist created:', therapist.id);

  const patient = await prisma.patient.create({
    data: {
      name: 'Test Patient',
      email: 'test-patient@example.com',
      passwordHash: 'hashed-password',
      phone: '08123456789',
      diagnosis: 'Test diagnosis',
      assignedTherapistId: therapist.id,
    },
  });
  console.log('Patient created:', patient.id);

  const session = await prisma.session.create({
    data: {
      patientId: patient.id,
      date: new Date(),
      exercise: 'forearm_supination',
      peakRom: 62.5,
      avgRom: 45.2,
      repsCompleted: 10,
      consistency: 'high',
      notes: 'test session note',
      gyroRawSampleCount: 100,
    },
  });
  console.log('Session created:', session.id);

  const note = await prisma.therapistNote.create({
    data: {
      therapistId: therapist.id,
      patientId: patient.id,
      weekNumber: 1,
      note: 'test weekly note',
    },
  });
  console.log('TherapistNote created:', note.id);

  // Read back
  const foundPatient = await prisma.patient.findUnique({ where: { id: patient.id } });
  const foundTherapist = await prisma.therapist.findUnique({ where: { id: therapist.id } });
  const foundSession = await prisma.session.findUnique({ where: { id: session.id } });
  const foundNote = await prisma.therapistNote.findUnique({ where: { id: note.id } });

  console.log('Read back patient:', foundPatient.email);
  console.log('Read back therapist:', foundTherapist.email);
  console.log('Read back session:', foundSession.exercise);
  console.log('Read back note:', foundNote.note);

  await prisma.$disconnect();
  console.log('Verification complete');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
