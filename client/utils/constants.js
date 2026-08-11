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
};

export const EXERCISE_LIST = Object.values(EXERCISES);
export const MAX_REPS = 10;
export const SENSOR_INTERVAL_MS = 100;
export const THERAPIST_CALL_LINK = 'https://meet.google.com/your-pulihtrack-room';
