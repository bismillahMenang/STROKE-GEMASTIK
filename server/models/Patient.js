const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    diagnosis: { type: String },
    assignedTherapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist' },
    language: { type: String, enum: ['id', 'en'], default: 'id' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
