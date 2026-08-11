import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EXERCISES } from '../utils/constants';

export default function SessionCard({ session, expanded, onPress }) {
  const exercise = EXERCISES[session.exercise];
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.date}><Text style={styles.dateText}>{new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</Text></View>
        <View style={styles.main}><Text style={styles.exercise}>{exercise?.name || session.exercise}</Text><Text style={styles.meta}>ROM puncak {session.peakRom}°</Text></View>
        {session.notes ? <Text style={styles.noteIcon}>▣</Text> : null}
      </View>
      {expanded && session.notes ? <Text style={styles.note}>{session.notes}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderBottomColor: '#D3D1C7', borderBottomWidth: 1, paddingVertical: 14 },
  row: { alignItems: 'center', flexDirection: 'row' },
  date: { width: 70 },
  dateText: { color: '#5F5E5A', fontSize: 14 },
  main: { flex: 1 },
  exercise: { color: '#2C2C2A', fontSize: 16, fontWeight: '600' },
  meta: { color: '#5F5E5A', fontSize: 14, marginTop: 3 },
  noteIcon: { color: '#D85A30', fontSize: 18, padding: 8 },
  note: { backgroundColor: '#F7F6F2', color: '#5F5E5A', fontSize: 15, lineHeight: 22, marginTop: 12, padding: 12 },
});
