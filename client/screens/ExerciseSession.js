import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, BackHandler, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import GyroSensor from '../components/GyroSensor';
import SessionSummary from '../components/SessionSummary';
import { EXERCISES, MAX_REPS } from '../utils/constants';
import { calculateROM } from '../utils/gyroProcessing';
import { saveSession, updateSession } from '../utils/storage';
import { TOKEN_KEY, uploadSession } from '../api/client';

export default function ExerciseSession({ navigation, route }) {
  const exercise = EXERCISES[route.params?.exercise] || EXERCISES.forearm_supination;
  const [state, setState] = useState('instructions');
  const [countdown, setCountdown] = useState(10);
  const [angle, setAngle] = useState(0);
  const [reps, setReps] = useState(0);
  const [result, setResult] = useState(null);
  const [note, setNote] = useState('');
  const [sensorError, setSensorError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const repsRef = useRef(0);
  const readingsRef = useRef([]);
  const angleRef = useRef(0);
  const peakRef = useRef(0);
  const repReadyRef = useRef(false);

  useEffect(() => {
    setState('instructions');
    setCountdown(10);
    setAngle(0);
    setReps(0);
    repsRef.current = 0;
    setResult(null);
    setNote('');
    setSaveMessage('');
    readingsRef.current = [];
    angleRef.current = 0;
    peakRef.current = 0;
    repReadyRef.current = false;
  }, [exercise.key]);

  useEffect(() => {
    if (state !== 'calibration') return undefined;
    const timer = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setState('recording');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (state !== 'recording') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Batalkan sesi ini?', 'Kemajuan rekaman akan dibuang.', [
        { text: 'Lanjutkan', style: 'cancel' },
        { text: 'Batalkan', style: 'destructive', onPress: () => navigation.navigate('Exercises') },
      ]);
      return true;
    });
    return () => subscription.remove();
  }, [navigation, state]);

  useEffect(() => {
    if (state !== 'recording') return undefined;
    const timer = setTimeout(stopRecording, 180000);
    return () => clearTimeout(timer);
  }, [state]);

  function startCalibration() {
    setSensorError('');
    setCountdown(10);
    setState('calibration');
  }

  function handleReading({ z }) {
    readingsRef.current.push(z);
    angleRef.current += z * 0.1 * (180 / Math.PI);
    const currentAngle = Math.abs(angleRef.current);
    setAngle(Math.round(currentAngle));

    if (currentAngle > peakRef.current) peakRef.current = currentAngle;
    if (currentAngle >= exercise.targetRom * 0.7) repReadyRef.current = true;
    if (repReadyRef.current && currentAngle <= exercise.targetRom * 0.25) {
      repReadyRef.current = false;
      setReps((current) => {
        const next = Math.min(MAX_REPS, current + 1);
        repsRef.current = next;
        if (next >= MAX_REPS) setTimeout(stopRecording, 0);
        return next;
      });
    }
  }

  function stopRecording() {
    if (state !== 'recording') return;
    const rom = calculateROM(readingsRef.current);
    setResult({ ...rom, repsCompleted: repsRef.current });
    setState('summary');
  }

  async function handleSave() {
    try {
      const storedSession = await saveSession({
        date: new Date().toISOString(),
        exercise: exercise.key,
        peakRom: result.peakRom,
        avgRom: result.avgRom,
        repsCompleted: result.repsCompleted,
        consistency: result.consistency,
        notes: note.trim(),
        gyroRawSampleCount: readingsRef.current.length,
      });
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const uploaded = await uploadSession(storedSession, token);
          await updateSession(storedSession.id, { pending: false, serverId: uploaded._id, syncedAt: new Date().toISOString() });
          setSaveMessage('Tersimpan');
        } catch (syncError) {
          if (syncError.response?.status === 401) console.error('Session expired during upload:', syncError);
          else console.error('Session upload deferred:', syncError.message);
          setSaveMessage('Tersimpan, akan disinkron nanti');
        }
      } else {
        setSaveMessage('Tersimpan di perangkat');
      }
      setTimeout(() => navigation.navigate('Exercises'), 900);
    } catch (error) {
      console.error('Failed to save local session:', error);
      setSensorError('Sesi belum tersimpan. Silakan coba lagi.');
    }
  }

  function redo() {
    setResult(null);
    setNote('');
    setState('instructions');
    readingsRef.current = [];
    setReps(0);
    repsRef.current = 0;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        {state === 'instructions' && <Instructions exercise={exercise} onStart={startCalibration} />}
        {state === 'calibration' && <Calibration countdown={countdown} onCancel={() => navigation.navigate('Exercises')} />}
        {state === 'recording' && (
          <Recording angle={angle} exercise={exercise} reps={reps} onStop={stopRecording} />
        )}
        {state === 'summary' && result && (
          <SessionSummary result={result} note={note} onNoteChange={setNote} />
        )}
        {sensorError ? <Text style={styles.error}>{sensorError}</Text> : null}
        {saveMessage ? <Text style={styles.saved}>{saveMessage}</Text> : null}
        {state === 'recording' && (
          <GyroSensor active onError={() => setSensorError('Sensor gerak tidak tersedia di perangkat ini.')} onReading={handleReading} />
        )}
        {state === 'summary' && (
          <View style={styles.actions}>
            <PrimaryButton label="Simpan" onPress={handleSave} />
            <Pressable accessibilityRole="button" onPress={redo} style={styles.secondaryButton}>
              <Text style={styles.secondaryLabel}>Ulangi</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function Instructions({ exercise, onStart }) {
  return <View><Text style={styles.helper}>{exercise.instruction}</Text><Text style={styles.target}>Target ROM: {exercise.targetRom}°</Text><PrimaryButton label="Mulai" onPress={onStart} /></View>;
}

function Calibration({ countdown, onCancel }) {
  return <View style={styles.center}><Text style={styles.helper}>Tahan ponsel diam selama kalibrasi.</Text><Text style={styles.countdown}>{countdown}</Text><Pressable accessibilityRole="button" onPress={onCancel}><Text style={styles.cancel}>Batal</Text></Pressable></View>;
}

function Recording({ angle, exercise, reps, onStop }) {
  const progress = Math.min(angle / exercise.targetRom, 1);
  return <View style={styles.center}><View style={[styles.gauge, { borderColor: progress >= 0.9 ? '#D85A30' : '#0F9E75' }]}><Text style={styles.angle}>{angle}°</Text><Text style={styles.gaugeLabel}>dari {exercise.targetRom}°</Text></View><Text style={styles.rep}>{reps} / {MAX_REPS}</Text><Text style={styles.helper}>Gerakkan perlahan dan tetap nyaman.</Text><PrimaryButton label="Selesai" onPress={onStop} /></View>;
}

function PrimaryButton({ label, onPress }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.primaryButton}><Text style={styles.primaryLabel}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F6F2', flex: 1 },
  container: { flex: 1, padding: 20 },
  exerciseName: { color: '#2C2C2A', fontSize: 24, fontWeight: '600', marginBottom: 18 },
  helper: { color: '#5F5E5A', fontSize: 17, lineHeight: 27 },
  target: { color: '#085041', fontSize: 17, fontWeight: '600', marginTop: 18 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  countdown: { color: '#085041', fontSize: 64, fontWeight: '700', marginVertical: 24 },
  cancel: { color: '#5F5E5A', fontSize: 16, padding: 12 },
  gauge: { alignItems: 'center', borderRadius: 130, borderWidth: 16, height: 230, justifyContent: 'center', width: 230 },
  angle: { color: '#2C2C2A', fontSize: 40, fontWeight: '700' },
  gaugeLabel: { color: '#5F5E5A', fontSize: 14, marginTop: 4 },
  rep: { color: '#2C2C2A', fontSize: 24, fontWeight: '600', marginVertical: 20 },
  primaryButton: { alignItems: 'center', backgroundColor: '#0F9E75', borderRadius: 8, justifyContent: 'center', minHeight: 50, paddingHorizontal: 20, marginTop: 28, width: '100%' },
  primaryLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  actions: { marginTop: 'auto' },
  secondaryButton: { alignItems: 'center', minHeight: 48, justifyContent: 'center', marginTop: 8 },
  secondaryLabel: { color: '#D85A30', fontSize: 16, fontWeight: '600' },
  error: { color: '#A32D2D', fontSize: 15, lineHeight: 22, marginTop: 16 },
  saved: { color: '#0F9E75', fontSize: 16, fontWeight: '600', marginTop: 16, textAlign: 'center' },
});
