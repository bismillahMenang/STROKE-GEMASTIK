// Integrates angular velocity over the sampling interval to estimate degrees moved.
function calculateROM(gyroZReadings, samplingIntervalSec = 0.1) {
  if (!gyroZReadings.length) {
    return { peakRom: 0, avgRom: 0, consistency: 'low' };
  }

  let angle = 0;
  const angleTrace = [];

  for (const z of gyroZReadings) {
    const deltaDeg = z * samplingIntervalSec * (180 / Math.PI);
    angle += deltaDeg;
    angleTrace.push(Math.abs(angle));
  }

  const peakRom = Math.max(...angleTrace);
  const avgRom = angleTrace.reduce((sum, value) => sum + value, 0) / angleTrace.length;
  const consistency = calculateConsistency(angleTrace);

  return { peakRom: round1(peakRom), avgRom: round1(avgRom), consistency };
}

// Compares the spread of the largest local movement peaks with their mean.
function calculateConsistency(angleTrace) {
  if (!angleTrace.length) return 'low';

  const peaks = [];
  for (let index = 1; index < angleTrace.length - 1; index += 1) {
    if (angleTrace[index] >= angleTrace[index - 1] && angleTrace[index] >= angleTrace[index + 1]) {
      peaks.push(angleTrace[index]);
    }
  }

  const selectedPeaks = (peaks.length ? peaks : [Math.max(...angleTrace)])
    .sort((a, b) => b - a)
    .slice(0, 10);
  const mean = selectedPeaks.reduce((sum, value) => sum + value, 0) / selectedPeaks.length;
  if (mean === 0) return 'low';

  const variance = selectedPeaks.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / selectedPeaks.length;
  const relativeStandardDeviation = Math.sqrt(variance) / mean;
  if (relativeStandardDeviation < 0.1) return 'high';
  if (relativeStandardDeviation < 0.25) return 'medium';
  return 'low';
}

// Jerk-based movement-quality score in 0..1 (higher = smoother).
// Jerk = third difference of the angle trace; the score maps RMS jerk to 0..1.
// TODO(clinical/tune): the scale is a placeholder until validated against
// captured data (see smoothness validation spec).
function calculateSmoothness(angleTrace, scale = 5) {
  if (angleTrace.length < 4) return 1;

  const jerk = [];
  for (let index = 3; index < angleTrace.length; index += 1) {
    jerk.push(angleTrace[index] - 3 * angleTrace[index - 1] + 3 * angleTrace[index - 2] - angleTrace[index - 3]);
  }

  const mean = jerk.reduce((sum, value) => sum + value, 0) / jerk.length;
  const squared = jerk.reduce((sum, value) => sum + ((value - mean) ** 2), 0);
  const rms = Math.sqrt(squared / jerk.length);

  return 1 / (1 + rms / scale);
}

// Per-rep metrics from the signed angle trace, segmented by the indices where
// each rep was counted (repEndIndices). Segment peak ROM is the excursion
// (max - min), per standard ROM calculation.
function computeRepMetrics(angleTrace, repEndIndices, samplingIntervalSec = 0.1, scale = 5) {
  const metrics = [];
  let start = 0;

  for (const end of repEndIndices) {
    if (end <= start || end > angleTrace.length) continue;
    const segment = angleTrace.slice(start, end);
    metrics.push({
      peakRomDeg: round1(Math.max(...segment) - Math.min(...segment)),
      durationMs: Math.round((end - start) * samplingIntervalSec * 1000),
      smoothness: round3(calculateSmoothness(segment, scale)),
    });
    start = end;
  }

  return metrics;
}

function averageSmoothness(repMetrics, angleTrace, scale = 200000) {
  if (!repMetrics.length) return calculateSmoothness(angleTrace, scale);
  return repMetrics.reduce((sum, metric) => sum + metric.smoothness, 0) / repMetrics.length;
}

// Rounds displayed ROM values to one decimal place without changing raw samples.
function round1(value) {
  return Math.round(value * 10) / 10;
}

function round3(value) {
  return Math.round(value * 1000) / 1000;
}

module.exports = {
  calculateROM,
  calculateConsistency,
  calculateSmoothness,
  computeRepMetrics,
  averageSmoothness,
  round1,
};