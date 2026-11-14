import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GyroSensor from '../components/GyroSensor';
import { useTheme } from '../theme/ThemeContext';
import { SENSOR_INTERVAL_MS } from '../utils/constants';

const SAMPLING_INTERVAL_SEC = SENSOR_INTERVAL_MS / 1000;

// Developer/debug screen (PulihGo GyroTestScreen): shows the raw gyroscope
// stream and the integrated angle used by exercises, with live tare.
export default function GyroTestScreen() {
  const { colors } = useTheme();
  const [raw, setRaw] = useState({ x: 0, y: 0, z: 0 });
  const [angle, setAngle] = useState(0);
  const [samples, setSamples] = useState(0);
  const [error, setError] = useState('');
  const angleRef = useRef(0);
  const countRef = useRef(0);

  function handleReading({ x, y, z }) {
    angleRef.current += z * SAMPLING_INTERVAL_SEC * (180 / Math.PI);
    countRef.current += 1;
    setRaw({ x, y, z });
    setAngle(Math.round(angleRef.current * 10) / 10);
    setSamples(countRef.current);
  }

  function tare() {
    angleRef.current = 0;
    countRef.current = 0;
    setAngle(0);
    setSamples(0);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Uji sensor</Text>
        <Text style={[styles.helper, { color: colors.body }]}>
          Layar ini untuk pengembang. Putar ponsel dan lihat respons sensor {SENSOR_INTERVAL_MS} ms.
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <Row label="X (rad/s)" value={raw.x.toFixed(3)} />
          <Row label="Y (rad/s)" value={raw.y.toFixed(3)} />
          <Row label="Z (rad/s)" value={raw.z.toFixed(3)} />
          <Row label="Sudut terintegrasi" value={`${angle}°`} />
          <Row label="Sampel diterima" value={String(samples)} />
        </View>
        <Pressable accessibilityRole="button" onPress={tare} style={[styles.button, { backgroundColor: colors.accent }]}>
          <Text style={styles.buttonLabel}>Setel ulang (tare)</Text>
        </Pressable>
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <GyroSensor active onError={(err) => setError(err.message || 'Sensor tidak tersedia.')} onReading={handleReading} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.body }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700' },
  helper: { fontSize: 16, lineHeight: 24, marginTop: 8 },
  card: { borderRadius: 12, borderWidth: 1, marginTop: 20, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 15, fontWeight: '700' },
  button: { alignItems: 'center', borderRadius: 8, justifyContent: 'center', minHeight: 50, marginTop: 20 },
  buttonLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  error: { fontSize: 15, marginTop: 12 },
});