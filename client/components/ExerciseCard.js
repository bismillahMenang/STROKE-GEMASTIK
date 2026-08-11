import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ExerciseCard({ exercise, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mulai ${exercise.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.accent} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.badge}>{exercise.targetRom}°</Text>
        </View>
        <Text style={styles.description}>{exercise.description}</Text>
        <Text style={styles.link}>Mulai latihan  ›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', borderColor: '#D3D1C7', borderRadius: 12,
    borderWidth: 1, flexDirection: 'row', marginBottom: 12, minHeight: 122,
  },
  pressed: { opacity: 0.78 },
  accent: { backgroundColor: '#0F9E75', borderBottomLeftRadius: 12, borderTopLeftRadius: 12, width: 4 },
  content: { flex: 1, padding: 16 },
  row: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  name: { color: '#2C2C2A', flex: 1, fontSize: 18, fontWeight: '600', marginRight: 8 },
  badge: { backgroundColor: '#E5F3EC', borderRadius: 12, color: '#085041', fontSize: 14, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 5 },
  description: { color: '#5F5E5A', fontSize: 16, lineHeight: 24, marginTop: 8 },
  link: { color: '#D85A30', fontSize: 16, fontWeight: '600', marginTop: 10 },
});
