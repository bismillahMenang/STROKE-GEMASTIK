import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@rehabtrack/theme';

export const palettes = {
  light: {
    bg: '#F7F6F2',
    card: '#FFFFFF',
    border: '#D3D1C7',
    text: '#2C2C2A',
    body: '#5F5E5A',
    muted: '#888780',
    accent: '#0F9E75',
    accentRgb: '15,158,117',
    accentDark: '#085041',
    accentSoft: '#E5F3EC',
    warn: '#D85A30',
    warnSoft: '#FBE9E2',
    danger: '#A32D2D',
    caution: '#BA7517',
    line: '#D3D1C7',
  },
  dark: {
    bg: '#0B0E11',
    card: '#121417',
    border: '#1C1F22',
    text: '#FFFFFF',
    body: '#8E9AA0',
    muted: '#5F6B6B',
    accent: '#00C2C2',
    accentRgb: '0,194,194',
    accentDark: '#7FE3E3',
    accentSoft: '#0F2A2A',
    warn: '#FFB020',
    warnSoft: '#2A1F0F',
    danger: '#FF5252',
    caution: '#FFB020',
    line: '#1C1F22',
  },
};

const ThemeContext = createContext({
  theme: 'light',
  colors: palettes.light,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => { if (saved === 'dark' || saved === 'light') setTheme(saved); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    theme,
    colors: palettes[theme],
    toggleTheme,
  }), [theme, toggleTheme]);

  if (!ready) return null;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}