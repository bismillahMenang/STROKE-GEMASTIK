const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['facial_asymmetry', 'speech_clarity'], required: true },
    score: { type: Number, min: 0, max: 1, required: true },
    risk: { type: String, enum: ['low', 'medium', 'high', 'unknown'], default: 'unknown' },
    modelVersion: { type: String, required: true },
    consentedAt: { type: Date },
  },
  { timestamps: true }
);

assessmentSchema.index({ patientId: 1, date: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
