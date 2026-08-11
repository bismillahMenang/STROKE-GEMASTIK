const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    licenseNumber: { type: String },
    clinic: { type: String },
    patientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Therapist', therapistSchema);
