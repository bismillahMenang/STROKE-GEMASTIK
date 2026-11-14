// Generates the two exercise sound assets as 16-bit PCM WAV files.
// Run once with: node scripts/generate-sounds.js
// WAV (PCM) is supported by Android ExoPlayer and iOS AVPlayer.

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i += 1) {
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  }

  fs.writeFileSync(filePath, buffer);
  console.log(`Wrote ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// Two-note chime with exponential decay: a short pleasant "ding".
function targetReachedSamples() {
  const durationSec = 0.4;
  const count = Math.floor(SAMPLE_RATE * durationSec);
  const notes = [880, 1318.5]; // A5 -> E6
  const noteLen = Math.floor(count / notes.length);
  const samples = new Array(count).fill(0);

  notes.forEach((freq, noteIndex) => {
    for (let i = 0; i < noteLen; i += 1) {
      const t = i / SAMPLE_RATE;
      const decay = Math.exp(-3.2 * t);
      samples[noteIndex * noteLen + i] = 0.5 * Math.sin(2 * Math.PI * freq * t) * decay;
    }
  });

  return samples;
}

// Two short beeps that read clearly as a warning when looped.
function ceilingWarningSamples() {
  const durationSec = 0.9;
  const count = Math.floor(SAMPLE_RATE * durationSec);
  const beepLen = Math.floor(SAMPLE_RATE * 0.18);
  const gapLen = Math.floor(SAMPLE_RATE * 0.06);
  const samples = new Array(count).fill(0);
  const freq = 554.4; // C#5 — a bit sharper than a plain alarm

  for (let start = 0; start + beepLen < count; start += beepLen + gapLen) {
    for (let i = 0; i < beepLen; i += 1) {
      const t = i / SAMPLE_RATE;
      const attack = Math.min(1, t / 0.005);
      samples[start + i] = 0.7 * Math.sin(2 * Math.PI * freq * t) * attack;
    }
  }

  return samples;
}

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });
writeWav(path.join(outDir, 'target-reached.wav'), targetReachedSamples());
writeWav(path.join(outDir, 'ceiling-warning.wav'), ceilingWarningSamples());