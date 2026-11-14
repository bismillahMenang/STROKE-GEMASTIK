import { Pressable, StyleSheet, Text, View } from 'react-native';

// Exercise icon mapping (emoji-based, no extra deps needed)
const EXERCISE_ICONS = {
  forearm_supination: '🔄',
  shoulder_abduction: '💪',
  elbow_flexion: '🦾',
  wrist_flexion: '✋',
  finger_extension: '🖐️',
  resistance_band_row: '🏋️',
};

const EXERCISE_COLORS = {
  forearm_supination: { bg: '#E5F3EC', accent: '#0F9E75' },
  shoulder_abduction: { bg: '#FFF3E0', accent: '#E09B2B' },
  elbow_flexion: { bg: '#E8F4FD', accent: '#185FA5' },
  wrist_flexion: { bg: '#F3E5F5', accent: '#8B3FA8' },
  finger_extension: { bg: '#FCE4EC', accent: '#C62828' },
  resistance_band_row: { bg: '#E8F5E9', accent: '#2E7D32' },
};

export default function ExerciseCard({ exercise, onPress }) {
  const icon = EXERCISE_ICONS[exercise.key] || '🏃';
  const color = EXERCISE_COLORS[exercise.key] || { bg: '#E5F3EC', accent: '#0F9E75' };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mulai ${exercise.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Icon column */}
      <View style={[styles.iconWrap, { backgroundColor: color.bg }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={2}>{exercise.name}</Text>
          <View style={[styles.badge, { backgroundColor: color.bg }]}>
            <Text style={[styles.badgeText, { color: color.accent }]}>{exercise.targetRom}°</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>{exercise.description}</Text>
        <View style={styles.footer}>
          <View style={[styles.startBtn, { backgroundColor: '#D85A30' }]}>
            <Text style={styles.startBtnText}>Mulai  ›</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0DED5',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#1E1E1C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  pressed: { transform: [{ scale: 0.975 }], opacity: 0.92 },

  // Left icon column
  iconWrap: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  icon: { fontSize: 32 },

  // Right content
  content: { flex: 1, padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  name: { color: '#1E1E1C', flex: 1, fontSize: 17, fontWeight: '700', lineHeight: 23, marginRight: 10 },
  badge: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 13, fontWeight: '700' },
  description: { color: '#5C5B57', fontSize: 14, lineHeight: 21, marginTop: 6 },
  footer: { marginTop: 12 },
  startBtn: {
    alignSelf: 'flex-start', borderRadius: 100,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  startBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});