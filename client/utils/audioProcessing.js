const FRAME_SIZE = 256;
const FRAME_COUNT = 24;
const MEL_FILTER_COUNT = 20;
const MFCC_COUNT = 13;

export function extractSpeechFeatures(samples, sampleRate = 16000) {
  if (!samples.length) return null;
  const frames = [];
  const step = Math.max(1, Math.floor((samples.length - FRAME_SIZE) / FRAME_COUNT));
  for (let start = 0; start + FRAME_SIZE <= samples.length && frames.length < FRAME_COUNT; start += step) {
    frames.push(extractFrame(samples.slice(start, start + FRAME_SIZE), sampleRate));
  }
  if (!frames.length) return null;

  const averaged = Array.from({ length: MFCC_COUNT }, (_, index) => frames.reduce((sum, frame) => sum + frame[index], 0) / frames.length);
  const energy = samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length;
  let crossings = 0;
  for (let index = 1; index < samples.length; index += 1) if ((samples[index] >= 0) !== (samples[index - 1] >= 0)) crossings += 1;
  return [...averaged, Math.log10(energy + 1e-8), crossings / samples.length, sampleRate / 16000];
}

function extractFrame(frame, sampleRate) {
  const windowed = frame.map((sample, index) => sample * (0.54 - 0.46 * Math.cos((2 * Math.PI * index) / (frame.length - 1))));
  const spectrum = [];
  for (let frequency = 0; frequency < FRAME_SIZE / 2; frequency += 1) {
    let real = 0;
    let imaginary = 0;
    for (let index = 0; index < FRAME_SIZE; index += 1) {
      const phase = (2 * Math.PI * frequency * index) / FRAME_SIZE;
      real += windowed[index] * Math.cos(phase);
      imaginary -= windowed[index] * Math.sin(phase);
    }
    spectrum.push((real * real + imaginary * imaginary) / FRAME_SIZE);
  }

  const melEnergies = [];
  for (let filter = 0; filter < MEL_FILTER_COUNT; filter += 1) {
    const start = Math.floor((filter / MEL_FILTER_COUNT) * spectrum.length);
    const end = Math.max(start + 1, Math.floor(((filter + 2) / MEL_FILTER_COUNT) * spectrum.length));
    const energy = spectrum.slice(start, end).reduce((sum, value) => sum + value, 0) / (end - start);
    melEnergies.push(Math.log(energy + 1e-8));
  }

  return Array.from({ length: MFCC_COUNT }, (_, coefficient) => melEnergies.reduce((sum, energy, index) => sum + energy * Math.cos((Math.PI * coefficient * (index + 0.5)) / MEL_FILTER_COUNT), 0));
}

export async function inferSpeechClarity(features) {
  if (!features) return null;
  const tf = await import('@tensorflow/tfjs');
  await tf.ready();
  const input = tf.tensor2d([features]);
  // Baseline weights are intentionally versioned until a validated clinical model is available.
  const weights = tf.tensor2d(Array.from({ length: features.length }, (_, index) => [index < 13 ? 0.015 : 0.08, index < 13 ? -0.015 : -0.08]));
  const bias = tf.tensor1d([0.05, -0.05]);
  const probabilities = tf.softmax(input.matMul(weights).add(bias));
  const values = await probabilities.data();
  input.dispose(); weights.dispose(); bias.dispose(); probabilities.dispose();
  const clarityScore = Math.round(values[0] * 1000) / 1000;
  return { clarityScore, risk: clarityScore > 0.65 ? 'low' : clarityScore > 0.4 ? 'medium' : 'high', modelVersion: 'phase2-audio-baseline-0.1' };
}
