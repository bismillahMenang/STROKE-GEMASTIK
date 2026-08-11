import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ROMChart from '../components/ROMChart';
import SessionCard from '../components/SessionCard';
import { EXERCISE_LIST, THERAPIST_CALL_LINK } from '../utils/constants';
import { getSessions } from '../utils/storage';
import { getAssessments } from '../utils/assessmentStorage';

export default function ProgressDashboard({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [exerciseKey, setExerciseKey] = useState(EXERCISE_LIST[0].key);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');
  const pendingCount = sessions.filter((session) => session.pending).length;

  useFocusEffect(useCallback(() => {
    let active = true;
    Promise.all([getSessions(), getAssessments()]).then(([items, checks]) => { if (active) { setSessions(items); setAssessments(checks); } }).catch((err) => {
      console.error('Failed to load progress:', err);
      if (active) setError('Riwayat latihan belum dapat dimuat.');
    });
    return () => { active = false; };
  }, []));

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekCount = sessions.filter((session) => new Date(session.date) >= weekStart).length;

  async function callTherapist() {
    try { await Linking.openURL(THERAPIST_CALL_LINK); } catch (err) { console.error('Unable to open therapist link:', err); setError('Tautan panggilan belum dapat dibuka.'); }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Progres Anda</Text>
        {pendingCount ? <Text style={styles.syncStatus}>{pendingCount} sesi menunggu sinkronisasi</Text> : null}
        <Text style={styles.sectionTitle}>Pemeriksaan tambahan</Text>
        <View style={styles.phaseTwoTools}><Pressable accessibilityRole="button" onPress={() => navigation.navigate('FaceCheck')} style={styles.phaseTwoButton}><Text style={styles.phaseTwoLabel}>Simetri wajah</Text><Text style={styles.phaseTwoHint}>Kamera, proses lokal</Text></Pressable><Pressable accessibilityRole="button" onPress={() => navigation.navigate('SpeechCheck')} style={styles.phaseTwoButton}><Text style={styles.phaseTwoLabel}>Kejelasan bicara</Text><Text style={styles.phaseTwoHint}>Perlu persetujuan mikrofon</Text></Pressable></View>
        {assessments.length ? <View style={styles.assessmentList}>{assessments.slice(0, 2).map((assessment) => <Text key={assessment.id || assessment._id} style={styles.assessmentText}>{assessment.type === 'facial_asymmetry' ? 'Simetri wajah' : 'Kejelasan bicara'}: {Math.round(assessment.score * 100)}% · {assessment.pending ? 'menunggu sinkronisasi' : 'tersimpan'}</Text>)}</View> : null}
        <View style={styles.stat}><Text style={styles.statValue}>{weekCount}</Text><Text style={styles.statLabel}>Sesi minggu ini</Text></View>
        <Text style={styles.sectionTitle}>Tren ROM</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>{EXERCISE_LIST.map((exercise) => <Pressable key={exercise.key} accessibilityRole="button" onPress={() => setExerciseKey(exercise.key)} style={[styles.selectorItem, exerciseKey === exercise.key && styles.selected]}><Text style={[styles.selectorText, exerciseKey === exercise.key && styles.selectedText]}>{exercise.name}</Text></Pressable>)}</ScrollView>
        <ROMChart exerciseKey={exerciseKey} sessions={sessions} />
        <Text style={styles.sectionTitle}>Sesi terakhir</Text>
        <View style={styles.sessionList}>{sessions.slice(0, 8).map((session) => <SessionCard key={session.id || session._id} expanded={expandedId === (session.id || session._id)} onPress={() => setExpandedId(expandedId === (session.id || session._id) ? null : (session.id || session._id))} session={session} />)}{!sessions.length && <Text style={styles.empty}>Belum ada sesi. Yuk mulai latihan pertama Anda.</Text>}</View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={callTherapist} style={styles.callButton}><Text style={styles.callLabel}>Hubungi terapis</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F6F2', flex: 1 },
  container: { padding: 20 },
  title: { color: '#2C2C2A', fontSize: 24, fontWeight: '600' },
  stat: { backgroundColor: '#FFFFFF', borderColor: '#D3D1C7', borderRadius: 12, borderWidth: 1, marginTop: 20, padding: 16 },
  statValue: { color: '#0F9E75', fontSize: 40, fontWeight: '700' },
  statLabel: { color: '#5F5E5A', fontSize: 16, marginTop: 4 },
  sectionTitle: { color: '#2C2C2A', fontSize: 18, fontWeight: '600', marginTop: 28 },
  selector: { marginTop: 12 },
  selectorItem: { borderColor: '#D3D1C7', borderRadius: 8, borderWidth: 1, justifyContent: 'center', marginRight: 8, minHeight: 44, minWidth: 118, paddingHorizontal: 10 },
  selected: { backgroundColor: '#0F9E75', borderColor: '#0F9E75' },
  selectorText: { color: '#5F5E5A', fontSize: 13, textAlign: 'center' },
  selectedText: { color: '#FFFFFF', fontWeight: '600' },
  sessionList: { backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 12, paddingHorizontal: 16 },
  empty: { color: '#5F5E5A', fontSize: 16, lineHeight: 24, paddingVertical: 24 },
  error: { color: '#A32D2D', fontSize: 15, lineHeight: 22, marginTop: 12 },
  syncStatus: { color: '#BA7517', fontSize: 14, marginTop: 8 },
  phaseTwoTools: { flexDirection: 'row', gap: 10, marginTop: 12 },
  phaseTwoButton: { backgroundColor: '#FFFFFF', borderColor: '#D3D1C7', borderRadius: 12, borderWidth: 1, flex: 1, minHeight: 80, padding: 12 },
  phaseTwoLabel: { color: '#2C2C2A', fontSize: 15, fontWeight: '600' },
  phaseTwoHint: { color: '#888780', fontSize: 13, lineHeight: 18, marginTop: 6 },
  assessmentList: { backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 10, padding: 12 },
  assessmentText: { color: '#5F5E5A', fontSize: 14, lineHeight: 22 },
  callButton: { alignItems: 'center', backgroundColor: '#D85A30', borderRadius: 8, justifyContent: 'center', minHeight: 50, marginTop: 28 },
  callLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
