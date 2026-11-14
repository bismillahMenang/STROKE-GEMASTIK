import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export const ONBOARDED_KEY = '@rehabtrack/onboarded';

const SLIDES = [
  {
    title: 'Latihan pemulihan stroke',
    body: 'RehabTrack membantu Anda berlatih gerakan di rumah. Tempelkan ponsel di lengan yang terdampak, lalu ikuti gerakan pada layar.',
  },
  {
    title: 'Kalibrasi dulu, lalu gerak pelan',
    body: 'Sesi dimulai dengan kalibrasi 10 detik: tahan ponsel diam di posisi netral. Setelah itu gerakkan lengan secara perlahan.',
  },
  {
    title: 'Nyeri = sinyal berhenti',
    body: 'Jangan pernah memaksakan gerakan melebihi batas nyaman. Jika terasa nyeri, berhenti dan istirahat — itu bagian dari pemulihan.',
  },
];

export default function OnboardingScreen({ onDone }) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function next() {
    if (isLast) {
      AsyncStorage.setItem(ONBOARDED_KEY, '1').catch(() => {});
      onDone();
      return;
    }
    setIndex(index + 1);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <Text style={[styles.brand, { color: colors.accent }]}>RehabTrack</Text>
        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
          <Text style={[styles.bodyText, { color: colors.body }]}>{slide.body}</Text>
        </View>
        <View style={styles.dots}>
          {SLIDES.map((_, dotIndex) => (
            <View key={dotIndex} style={[styles.dot, { backgroundColor: dotIndex === index ? colors.accent : colors.line }]} />
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={next} style={[styles.button, { backgroundColor: colors.accent }]}>
          <Text style={styles.buttonLabel}>{isLast ? 'Mulai berlatih' : 'Lanjut'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 24 },
  brand: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  body: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', lineHeight: 34 },
  bodyText: { fontSize: 17, lineHeight: 27, marginTop: 14 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { borderRadius: 4, height: 8, width: 8 },
  button: { alignItems: 'center', borderRadius: 8, justifyContent: 'center', minHeight: 52, width: '100%' },
  buttonLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});