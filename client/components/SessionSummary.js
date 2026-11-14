import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PAIN_OPTIONS } from '../utils/constants';

const PAIN_EMOJI = { none: '😊', mild: '😐', stopped: '😣' };
const PAIN_COLORS = {
  none: { bg: '#E5F3EC', border: '#0F9E75', text: '#085041' },
  mild: { bg: '#FFF8E1', border: '#BA7517', text: '#7A4E0D' },
  stopped: { bg: '#FDECEA', border: '#A32D2D', text: '#A32D2D' },
};

export default function SessionSummary({ result, note, onNoteChange, pain, onPainChange, targetReps }) {
  return (
    <View>
      {/* Success header */}
      <View style={styles.successHeader}>
        <Text style={styles.celebration}>🎉</Text>
        <Text style={styles.heading}>Luar biasa!</Text>
        <Text style={styles.helper}>Sesi hari ini selesai. Berikut ringkasan gerakan Anda.</Text>
      </View>

      {/* Metric grid */}
      <View style={styles.metrics}>
        <MetricCard icon="📐" label="ROM puncak" value={`${result.peakRom}°`} accent="#0F9E75" />
        <MetricCard icon="📊" label="ROM rata-rata" value={`${result.avgRom}°`} accent="#085041" />
        <MetricCard icon="🔄" label="Repetisi" value={`${result.repsCompleted}/${targetReps}`} accent="#185FA5" />
        <MetricCard icon="✅" label="Konsistensi" value={result.consistency} accent="#639922" />
        <MetricCard icon="🌊" label="Kelancaran" value={`${Math.round(result.avgSmoothness * 100)}%`} accent="#0F9E75" />
      </View>

      {/* Ceiling warning */}
      {result.ceilingHits > 0 ? (
        <View style={styles.ceilingWarn}>
          <Text style={styles.ceilingWarnIcon}>⚠️</Text>
          <Text style={styles.ceilingWarnText}>
            Anda melewati batas aman ROM sebanyak {result.ceilingHits}× — lain kali hentikan gerakan begitu terasa menahan.
          </Text>
        </View>
      ) : null}

      {/* Pain selector */}
      <Text style={styles.label}>Bagaimana rasa gerakan Anda?</Text>
      <View style={styles.painRow}>
        {PAIN_OPTIONS.map((option) => {
          const selected = pain === option.key;
          const color = PAIN_COLORS[option.key];
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.key}
              onPress={() => onPainChange(option.key)}
              style={[
                styles.painOption,
                selected && { backgroundColor: color.bg, borderColor: color.border },
              ]}
            >
              <Text style={styles.painEmoji}>{PAIN_EMOJI[option.key]}</Text>
              <Text style={[styles.painLabel, selected && { color: color.text, fontWeight: '700' }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!pain ? (
        <View style={styles.painHintRow}>
          <Text style={styles.painHintIcon}>👆</Text>
          <Text style={styles.painHint}>Pilih tingkat nyeri untuk menyimpan sesi.</Text>
        </View>
      ) : null}

      {/* Note input */}
      <Text style={styles.label}>Catatan (opsional)</Text>
      <TextInput
        accessibilityLabel="Catatan sesi"
        multiline
        onChangeText={onNoteChange}
        placeholder="Contoh: terasa sedikit lelah hari ini..."
        placeholderTextColor="#9B9992"
        style={styles.input}
        value={note}
      />
    </View>
  );
}

function MetricCard({ icon, label, value, accent }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Success header
  successHeader: {
    alignItems: 'center',
    backgroundColor: '#E5F3EC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  celebration: { fontSize: 40, marginBottom: 8 },
  heading: { color: '#085041', fontSize: 24, fontWeight: '700' },
  helper: { color: '#3A7A5C', fontSize: 15, lineHeight: 22, marginTop: 6, textAlign: 'center' },

  // Metrics
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  metric: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0DED5',
    borderRadius: 14,
    borderWidth: 1,
    minWidth: '46%',
    flex: 1,
    padding: 14,
    alignItems: 'flex-start',
    shadowColor: '#1E1E1C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  metricIcon: { fontSize: 20, marginBottom: 8 },
  metricValue: { fontSize: 26, fontWeight: '700' },
  metricLabel: { color: '#5C5B57', fontSize: 12, fontWeight: '600', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Ceiling warning
  ceilingWarn: {
    backgroundColor: '#FDECEA',
    borderColor: '#A32D2D',
    borderLeftWidth: 3,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    padding: 12,
  },
  ceilingWarnIcon: { fontSize: 16 },
  ceilingWarnText: { color: '#A32D2D', fontSize: 14, lineHeight: 20, flex: 1, fontWeight: '500' },

  // Labels
  label: { color: '#1E1E1C', fontSize: 15, fontWeight: '700', marginTop: 20, marginBottom: 10 },

  // Pain selector
  painRow: { flexDirection: 'row', gap: 8 },
  painOption: {
    borderColor: '#E0DED5', borderRadius: 12, borderWidth: 1.5,
    flex: 1, alignItems: 'center', paddingVertical: 10,
  },
  painEmoji: { fontSize: 24, marginBottom: 4 },
  painLabel: { color: '#5C5B57', fontSize: 11, fontWeight: '600', textAlign: 'center', letterSpacing: 0.2 },

  painHintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  painHintIcon: { fontSize: 14 },
  painHint: { color: '#BA7517', fontSize: 13, fontWeight: '500' },

  // Note input
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0DED5',
    borderRadius: 14,
    borderWidth: 1.5,
    color: '#1E1E1C',
    fontSize: 15,
    minHeight: 100,
    padding: 14,
    textAlignVertical: 'top',
  },
});