export const translations = {
  id: { appName: 'PulihTrack', login: 'Masuk', logout: 'Keluar', patients: 'Pasien Saya' },
  en: { appName: 'PulihTrack', login: 'Sign in', logout: 'Log out', patients: 'My Patients' },
};

export function t(language, key) { return translations[language]?.[key] || translations.id[key] || key; }
