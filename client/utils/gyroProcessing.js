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

// Rounds displayed ROM values to one decimal place without changing raw samples.
function round1(value) {
  return Math.round(value * 10) / 10;
}

module.exports = { calculateROM, calculateConsistency, round1 };
