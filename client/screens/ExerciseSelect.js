import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ExerciseCard from '../components/ExerciseCard';
import { EXERCISE_LIST } from '../utils/constants';
import { t } from '../i18n';

export default function ExerciseSelect({ navigation }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat sore';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.appBadge}>
              <Text style={styles.appBadgeText}>RT</Text>
            </View>
            <Text style={styles.appName}>{t('appName')}</Text>
          </View>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.title}>{t('chooseExercise')}</Text>
          <Text style={styles.subtitle}>Pilih satu latihan untuk memulai sesi Anda hari ini.</Text>
        </View>

        {/* Decorative info strip */}
        <View style={styles.infoStrip}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>Latihan rutin setiap hari mempercepat pemulihan. Lakukan dengan perlahan dan nyaman.</Text>
        </View>

        {/* Exercise list */}
        <View style={styles.list}>
          <Text style={styles.sectionLabel}>PILIH LATIHAN</Text>
          {EXERCISE_LIST.map((exercise) => (
            <ExerciseCard
              key={exercise.key}
              exercise={exercise}
              onPress={() => navigation.navigate('ExerciseSession', { exercise: exercise.key })}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F2F1ED', flex: 1 },
  container: { padding: 20, paddingBottom: 32 },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1E1E1C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  appBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#0F9E75', alignItems: 'center', justifyContent: 'center',
  },
  appBadgeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  appName: { color: '#0F9E75', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  greeting: { color: '#5C5B57', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  title: { color: '#1E1E1C', fontSize: 24, fontWeight: '700', lineHeight: 32 },
  subtitle: { color: '#5C5B57', fontSize: 15, lineHeight: 22, marginTop: 6 },

  // Info strip
  infoStrip: {
    backgroundColor: '#E5F3EC',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    marginBottom: 20,
  },
  infoIcon: { fontSize: 16, marginTop: 1 },
  infoText: { color: '#085041', fontSize: 13, lineHeight: 20, flex: 1, fontWeight: '500' },

  // List
  list: { flex: 1 },
  sectionLabel: {
    color: '#9B9992', fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 12,
  },
});