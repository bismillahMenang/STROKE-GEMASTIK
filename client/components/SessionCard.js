import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EXERCISES, PAIN_LABELS } from '../utils/constants';

const PAIN_DOT = { none: '#0F9E75', mild: '#BA7517', stopped: '#A32D2D' };
const PAIN_BG = { none: '#E5F3EC', mild: '#FFF8E1', stopped: '#FDECEA' };

export default function SessionCard({ session, expanded, onPress }) {
  const exercise = EXERCISES[session.exercise];
  const painLabel = PAIN_LABELS[session.pain];
  const dotColor = PAIN_DOT[session.pain] || '#9B9992';
  const dotBg = PAIN_BG[session.pain] || '#F2F1ED';

  const dateObj = new Date(session.date);
  const day = dateObj.toLocaleDateString('id-ID', { day: 'numeric' });
  const mon = dateObj.toLocaleDateString('id-ID', { month: 'short' });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        {/* Date chip */}
        <View style={styles.dateChip}>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateMon}>{mon}</Text>
        </View>

        {/* Main info */}
        <View style={styles.main}>
          <Text style={styles.exercise} numberOfLines={1}>{exercise?.name || session.exercise}</Text>
          <Text style={styles.meta}>ROM puncak {session.peakRom}°</Text>
        </View>

        {/* Pain badge */}
        {painLabel ? (
          <View style={[styles.painBadge, { backgroundColor: dotBg }]}>
            <View style={[styles.painDot, { backgroundColor: dotColor }]} />
            <Text style={[styles.painText, { color: dotColor }]}>{painLabel}</Text>
          </View>
        ) : null}

        {/* Expand indicator */}
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {/* Expanded detail */}
      {expanded ? (
        <View style={styles.detail}>
          <View style={styles.detailGrid}>
            {Number.isFinite(session.avgSmoothness) ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🌊</Text>
                <Text style={styles.detailValue}>{Math.round(session.avgSmoothness * 100)}%</Text>
                <Text style={styles.detailLabel}>Kelancaran</Text>
              </View>
            ) : null}
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🔄</Text>
              <Text style={styles.detailValue}>{session.repsCompleted}</Text>
              <Text style={styles.detailLabel}>Repetisi</Text>
            </View>
          </View>
          {session.ceilingHits > 0 ? (
            <View style={styles.warnRow}>
              <Text style={styles.warnIcon}>⚠️</Text>
              <Text style={styles.warnText}>Melewati batas aman ROM {session.ceilingHits}×</Text>
            </View>
          ) : null}
          {session.notes ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>📝 Catatan</Text>
              <Text style={styles.noteText}>{session.notes}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#F0EEE7',
    borderBottomWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 2,
  },
  pressed: { opacity: 0.82 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },

  // Date chip
  dateChip: {
    alignItems: 'center',
    backgroundColor: '#F2F1ED',
    borderRadius: 10,
    minWidth: 42,
    paddingVertical: 5,
  },
  dateDay: { color: '#1E1E1C', fontSize: 16, fontWeight: '700' },
  dateMon: { color: '#9B9992', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Main info
  main: { flex: 1 },
  exercise: { color: '#1E1E1C', fontSize: 15, fontWeight: '700' },
  meta: { color: '#5C5B57', fontSize: 13, marginTop: 2 },

  // Pain badge
  painBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, gap: 5, paddingHorizontal: 8, paddingVertical: 4,
  },
  painDot: { width: 7, height: 7, borderRadius: 4 },
  painText: { fontSize: 11, fontWeight: '700' },

  chevron: { color: '#9B9992', fontSize: 10, paddingHorizontal: 4 },

  // Expanded detail
  detail: { marginTop: 12, borderTopColor: '#F0EEE7', borderTopWidth: 1, paddingTop: 12 },
  detailGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  detailItem: {
    alignItems: 'center', backgroundColor: '#F8F7F3', borderRadius: 12,
    flex: 1, paddingVertical: 10,
  },
  detailIcon: { fontSize: 20, marginBottom: 4 },
  detailValue: { color: '#1E1E1C', fontSize: 20, fontWeight: '700' },
  detailLabel: { color: '#9B9992', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  warnRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  warnIcon: { fontSize: 14 },
  warnText: { color: '#A32D2D', fontSize: 13, fontWeight: '600' },

  noteBox: { backgroundColor: '#F8F7F3', borderRadius: 10, padding: 12 },
  noteLabel: { color: '#5C5B57', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  noteText: { color: '#1E1E1C', fontSize: 14, lineHeight: 21 },
});