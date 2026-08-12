/**
 * Generate six deterministic synthetic PCM WAV fixtures.
 * These are signal-processing smoke fixtures, not human speech or clinical data.
 * Run: node data/generate_audio_fixtures.js
 */

const fs = require('fs');
const path = require('path');
const { computeDysarthriaScore } = require('../client/utils/audioProcessing');

const fixturesDir = path.join(__dirname, 'test', 'fixtures');
const sampleRate = 16000;
fs.mkdirSync(fixturesDir, { recursive: true });

function generateSamples({ duration, frequency, silenceFraction, volumeInstability, noise, seed }) {
  const totalSamples = duration * sampleRate;
  const samples = new Float32Array(totalSamples);
  let randomState = seed;
  const random = () => {
    randomState = (randomState * 1664525 + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };

  for (let index = 0; index < totalSamples; index += 1) {
    const time = index / sampleRate;
    const pausePhase = (time * 1.2) % 1;
    const paused = pausePhase > 1 - silenceFraction;
    const jitter = (random() - 0.5) * volumeInstability;
    const amplitude = paused ? 0.001 : 0.24 * Math.max(0.05, 1 + jitter);
    const voiced = Math.sin(2 * Math.PI * frequency * time) + 0.25 * Math.sin(2 * Math.PI * frequency * 2 * time);
    samples[index] = voiced * amplitude + (paused ? 0 : (random() - 0.5) * noise);
  }
  return samples;
}

function toWav(samples) {
  const dataSize = samples.length * 2;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + dataSize, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22); header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(dataSize, 40);
  const pcm = Buffer.alloc(dataSize);
  samples.forEach((value, index) => pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), index * 2));
  return Buffer.concat([header, pcm]);
}

const fixtures = [
  ['normal_speech_1.wav', 'normal', { frequency: 2600, silenceFraction: 0.05, volumeInstability: 0.05, noise: 0.001, seed: 1 }],
  ['normal_speech_2.wav', 'normal', { frequency: 2800, silenceFraction: 0.08, volumeInstability: 0.08, noise: 0.001, seed: 2 }],
  ['normal_speech_3.wav', 'normal', { frequency: 2400, silenceFraction: 0.06, volumeInstability: 0.1, noise: 0.001, seed: 3 }],
  ['moderate_dysarthria_1.wav', 'moderate', { frequency: 1400, silenceFraction: 0.45, volumeInstability: 0.45, noise: 0.002, seed: 4 }],
  ['moderate_dysarthria_2.wav', 'moderate', { frequency: 1200, silenceFraction: 0.48, volumeInstability: 0.55, noise: 0.002, seed: 5 }],
  ['severe_dysarthria_1.wav', 'severe', { frequency: 600, silenceFraction: 0.72, volumeInstability: 0.9, noise: 0.003, seed: 6 }],
];

console.log('Generating 6 synthetic audio fixtures...');
for (const [name, label, params] of fixtures) {
  const samples = generateSamples({ ...params, duration: 10 });
  const wav = toWav(samples);
  fs.writeFileSync(path.join(fixturesDir, name), wav);
  console.log(`- ${name}: ${label}, score ${computeDysarthriaScore(samples, sampleRate)}`);
}
console.log(`Fixtures written to ${fixturesDir}`);
