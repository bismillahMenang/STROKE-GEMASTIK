import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ExerciseCard from '../components/ExerciseCard';
import { EXERCISE_LIST } from '../utils/constants';
import { t } from '../i18n';

export default function ExerciseSelect({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>{t('appName')}</Text>
        <Text style={styles.title}>{t('chooseExercise')}</Text>
        <Text style={styles.subtitle}>Pilih satu latihan untuk memulai sesi Anda hari ini.</Text>
        <View style={styles.list}>
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
  safeArea: { backgroundColor: '#F7F6F2', flex: 1 },
  container: { padding: 20 },
  eyebrow: { color: '#0F9E75', fontSize: 16, fontWeight: '700', letterSpacing: 0.5, marginTop: 8 },
  title: { color: '#2C2C2A', fontSize: 24, fontWeight: '600', marginTop: 8 },
  subtitle: { color: '#5F5E5A', fontSize: 16, lineHeight: 24, marginTop: 8 },
  list: { marginTop: 24 },
});
