const mongoose = require('mongoose');

const therapistNoteSchema = new mongoose.Schema(
  {
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    weekNumber: { type: Number, required: true, min: 1, max: 8 },
    note: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TherapistNote', therapistNoteSchema);
