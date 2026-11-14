// Configure both values in client/.env. The development fallback only works
// on a simulator or web; a physical device must use the computer's LAN IP.
const DEFAULT_DEV_API_URL = 'http://localhost:5000/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? DEFAULT_DEV_API_URL : '');
export const THERAPIST_CALL_LINK = process.env.EXPO_PUBLIC_THERAPIST_CALL_URL || '';

export const EXERCISES = {
  forearm_supination: {
    key: 'forearm_supination',
    name: 'Rotasi lengan bawah',
    description: 'Putar telapak tangan ke atas dan ke bawah.',
    // TODO(clinical/tune): target/ceiling below are unvalidated placeholders
    // until a therapist owns the numbers via the prescription flow.
    targetRom: 80,
    romCeilingDeg: 90,
    instruction: 'Pegang ponsel dengan telapak tangan menghadap ke bawah. Putar pergelangan secara perlahan ke dua arah.',
  },
  shoulder_abduction: {
    key: 'shoulder_abduction',
    name: 'Angkat bahu ke samping',
    description: 'Angkat lengan ke samping sampai setinggi bahu.',
    // TODO(clinical/tune): see forearm_supination.
    targetRom: 90,
    romCeilingDeg: 100,
    instruction: 'Letakkan ponsel dengan aman di telapak tangan. Angkat lengan ke samping secara perlahan sampai setinggi bahu.',
  },
  elbow_flexion: {
    key: 'elbow_flexion',
    name: 'Tekuk siku',
    description: 'Tekuk siku seperti gerakan curl yang perlahan.',
    // TODO(clinical/tune): see forearm_supination.
    targetRom: 150,
    romCeilingDeg: 160,
    instruction: 'Pegang ponsel di telapak tangan. Tekuk siku mendekat ke bahu, lalu turunkan kembali dengan perlahan.',
  },
  wrist_flexion: {
    key: 'wrist_flexion',
    name: 'Tekuk pergelangan',
    description: 'Gerakkan pergelangan ke arah telapak dan punggung tangan.',
    // TODO(clinical/tune): provisional target; replace with therapist-derived
    // target after Phase 2 feedback.
    targetRom: 60,
    romCeilingDeg: 75,
    instruction: 'Letakkan lengan bawah dengan nyaman. Tekuk pergelangan ke arah telapak, lalu kembali perlahan.',
  },
  finger_extension: {
    key: 'finger_extension',
    name: 'Buka jari',
    description: 'Buka jari perlahan lalu rilekskan kembali.',
    // TODO(clinical/tune): provisional target; this is a monitoring target,
    // not a clinical prescription.
    targetRom: 30,
    romCeilingDeg: 40,
    instruction: 'Letakkan tangan di permukaan datar. Buka jari selebar dan senyaman mungkin, lalu rilekskan.',
  },
  resistance_band_row: {
    key: 'resistance_band_row',
    name: 'Tarik resistance band',
    description: 'Tarik band ke arah tubuh dengan bahu tetap rileks.',
    // TODO(clinical/tune): provisional target; confirm resistance and range
    // with a therapist before pilot use.
    targetRom: 45,
    romCeilingDeg: 60,
    instruction: 'Gunakan resistance band sesuai arahan terapis. Tarik perlahan ke arah tubuh tanpa menahan napas.',
  },
};

export const EXERCISE_LIST = Object.values(EXERCISES);
export const MAX_REPS = 10;

// TODO(clinical/tune): unvalidated placeholder — validate REP_ENTER_RATIO and REP_EXIT_RATIO with a clinician.
export const REP_ENTER_RATIO = 0.45; // enter threshold as a fraction of target ROM
export const REP_EXIT_RATIO = 0.18; // rep counted once angle returns below this fraction

// TODO(clinical/tune): unvalidated jerk scale for the 0..1 smoothness score.
// Third-difference jerk on degree-scale data at 10 Hz is typically ~0.5-10,
// so a scale of 5 spreads the score usefully across real sessions (PulihGo's
// 200000 was calibrated for other units and is itself flagged unvalidated).
export const SMOOTHNESS_JERK_SCALE = 5;

export const DEFAULT_ROM_CEILING_DEG = 90; // safety cap when a prescription omits it
export const PRESCRIPTION_FETCH_TIMEOUT_MS = 4000;

export const PAIN_OPTIONS = [
  { key: 'none', label: 'Tanpa nyeri' },
  { key: 'mild', label: 'Nyeri ringan' },
  { key: 'stopped', label: 'Berhenti karena nyeri' },
];
export const PAIN_LABELS = Object.fromEntries(PAIN_OPTIONS.map((option) => [option.key, option.label]));

// TODO(clinical/tune): placeholder sampling rate; tied to Gyroscope.setUpdateInterval.
export const SENSOR_INTERVAL_MS = 100;