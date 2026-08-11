export const API_URL = __DEV__
  ? 'http://<your-local-ip>:5000/api'
  : 'https://<your-deployed-backend>.onrender.com/api';

export const EXERCISES = {
  forearm_supination: {
    key: 'forearm_supination',
    name: 'Rotasi lengan bawah',
    description: 'Putar telapak tangan ke atas dan ke bawah.',
    targetRom: 80,
    instruction: 'Pegang ponsel dengan telapak tangan menghadap ke bawah. Putar pergelangan secara perlahan ke dua arah.',
  },
  shoulder_abduction: {
    key: 'shoulder_abduction',
    name: 'Angkat bahu ke samping',
    description: 'Angkat lengan ke samping sampai setinggi bahu.',
    targetRom: 90,
    instruction: 'Letakkan ponsel dengan aman di telapak tangan. Angkat lengan ke samping secara perlahan sampai setinggi bahu.',
  },
  elbow_flexion: {
    key: 'elbow_flexion',
    name: 'Tekuk siku',
    description: 'Tekuk siku seperti gerakan curl yang perlahan.',
    targetRom: 150,
    instruction: 'Pegang ponsel di telapak tangan. Tekuk siku mendekat ke bahu, lalu turunkan kembali dengan perlahan.',
  },
  wrist_flexion: {
    key: 'wrist_flexion',
    name: 'Tekuk pergelangan',
    description: 'Gerakkan pergelangan ke arah telapak dan punggung tangan.',
    // Provisional target; replace with therapist-derived target after Phase 2 feedback.
    targetRom: 60,
    instruction: 'Letakkan lengan bawah dengan nyaman. Tekuk pergelangan ke arah telapak, lalu kembali perlahan.',
  },
  finger_extension: {
    key: 'finger_extension',
    name: 'Buka jari',
    description: 'Buka jari perlahan lalu rilekskan kembali.',
    // Provisional target; this is a monitoring target, not a clinical prescription.
    targetRom: 30,
    instruction: 'Letakkan tangan di permukaan datar. Buka jari selebar dan senyaman mungkin, lalu rilekskan.',
  },
  resistance_band_row: {
    key: 'resistance_band_row',
    name: 'Tarik resistance band',
    description: 'Tarik band ke arah tubuh dengan bahu tetap rileks.',
    // Provisional target; confirm resistance and range with a therapist before pilot use.
    targetRom: 45,
    instruction: 'Gunakan resistance band sesuai arahan terapis. Tarik perlahan ke arah tubuh tanpa menahan napas.',
  },
};

export const EXERCISE_LIST = Object.values(EXERCISES);
export const MAX_REPS = 10;
export const SENSOR_INTERVAL_MS = 100;
export const THERAPIST_CALL_LINK = 'https://meet.google.com/your-pulihtrack-room';
