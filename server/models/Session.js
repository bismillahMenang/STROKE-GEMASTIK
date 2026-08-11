const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, required: true },
    exercise: {
      type: String,
      enum: ['forearm_supination', 'shoulder_abduction', 'elbow_flexion', 'wrist_flexion', 'finger_extension', 'resistance_band_row'],
      required: true,
    },
    peakRom: { type: Number },
    avgRom: { type: Number },
    repsCompleted: { type: Number, min: 0, max: 10 },
    consistency: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    notes: { type: String },
    gyroRawSampleCount: { type: Number },
    syncedAt: { type: Date },
    reviewStatus: { type: String, enum: ['unreviewed', 'good', 'attention'], default: 'unreviewed' },
  },
  { timestamps: true }
);

sessionSchema.index({ patientId: 1, date: -1 });

module.exports = mongoose.model('Session', sessionSchema);
