import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function SessionSummary({ result, note, onNoteChange }) {
  return (
    <View>
      <Text style={styles.heading}>Bagus, sesi selesai</Text>
      <Text style={styles.helper}>Berikut ringkasan gerakan Anda hari ini.</Text>
      <View style={styles.metrics}>
        <Metric label="ROM puncak" value={`${result.peakRom}°`} />
        <Metric label="ROM rata-rata" value={`${result.avgRom}°`} />
        <Metric label="Repetisi" value={`${result.repsCompleted} / 10`} />
        <Metric label="Konsistensi" value={result.consistency} />
      </View>
      <Text style={styles.label}>Catatan (opsional)</Text>
      <TextInput
        accessibilityLabel="Catatan sesi"
        multiline
        onChangeText={onNoteChange}
        placeholder="Contoh: terasa sedikit lelah hari ini"
        placeholderTextColor="#888780"
        style={styles.input}
        value={note}
      />
    </View>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: '#2C2C2A', fontSize: 24, fontWeight: '600' },
  helper: { color: '#5F5E5A', fontSize: 16, lineHeight: 24, marginTop: 8 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  metric: { backgroundColor: '#FFFFFF', borderColor: '#D3D1C7', borderRadius: 12, borderWidth: 1, minWidth: '45%', padding: 16 },
  value: { color: '#085041', fontSize: 28, fontWeight: '700' },
  metricLabel: { color: '#5F5E5A', fontSize: 14, marginTop: 6 },
  label: { color: '#2C2C2A', fontSize: 16, fontWeight: '600', marginTop: 24 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#D3D1C7', borderRadius: 8, borderWidth: 1, color: '#2C2C2A', fontSize: 16, minHeight: 96, padding: 12, textAlignVertical: 'top', marginTop: 8 },
});
