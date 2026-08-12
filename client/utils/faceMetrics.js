const MEDIAPIPE_PAIR_COUNT = 12;

function calculateAsymmetryScore(input) {
  const points = collectPoints(input);
  if (points.length < MEDIAPIPE_PAIR_COUNT) return null;

  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const faceWidth = maxX - minX;
  if (!faceWidth) return null;

  const centerX = (minX + maxX) / 2;
  const left = points.filter((point) => point.x < centerX);
  const right = points.filter((point) => point.x >= centerX);
  if (!left.length || !right.length) return null;

  const differences = left.map((point) => {
    const mirrorDistance = centerX - point.x;
    const match = right.reduce((best, candidate) => Math.abs(candidate.y - point.y) < Math.abs(best.y - point.y) ? candidate : best, right[0]);
    const rightDistance = match.x - centerX;
    return Math.abs(mirrorDistance - rightDistance) / faceWidth;
  });
  const score = differences.reduce((sum, value) => sum + value, 0) / differences.length;
  return Math.min(1, Math.max(0, round3(score)));
}

function asymmetryRisk(score) {
  if (score === null || score === undefined) return 'unknown';
  if (score < 0.08) return 'low';
  if (score < 0.18) return 'medium';
  return 'high';
}

function collectPoints(input) {
  const points = [];
  const visit = (value) => {
    if (!value || points.length > 1200) return;
    if (typeof value.x === 'number' && typeof value.y === 'number') { points.push({ x: value.x, y: value.y }); return; }
    if (Array.isArray(value)) {
      if (typeof value[0] === 'number' && typeof value[1] === 'number') { points.push({ x: value[0], y: value[1] }); return; }
      value.forEach(visit);
      return;
    }
    if (typeof value === 'object') Object.values(value).forEach(visit);
  };
  visit(input?.faceLandmarks?.[0] || input?.landmarks || input?.contours || input);
  return points;
}

function round3(value) { return Math.round(value * 1000) / 1000; }

module.exports = { calculateAsymmetryScore, asymmetryRisk };
