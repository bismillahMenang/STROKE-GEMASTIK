export const DEFAULT_LANGUAGE = 'id';

const strings = {
  id: {
    appName: 'RehabTrack',
    login: 'Masuk',
    register: 'Daftar',
    chooseExercise: 'Pilih latihan',
    progress: 'Progres Anda',
    start: 'Mulai',
    save: 'Simpan',
    retry: 'Ulangi',
    therapist: 'Hubungi terapis',
  },
  en: {
    appName: 'RehabTrack',
    login: 'Sign in',
    register: 'Register',
    chooseExercise: 'Choose an exercise',
    progress: 'Your progress',
    start: 'Start',
    save: 'Save',
    retry: 'Redo',
    therapist: 'Contact therapist',
  },
};

export function t(key, language = DEFAULT_LANGUAGE) {
  return strings[language]?.[key] || strings.id[key] || key;
}

export { strings };
