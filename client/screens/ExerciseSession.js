import { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Pressable, SafeAreaView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GyroSensor from '../components/GyroSensor';
import SessionSummary from '../components/SessionSummary';
import PrimaryButton from '../components/PrimaryButton';
import styles from '../components/exerciseSessionStyles';
import {
  EXERCISES,
  REP_ENTER_RATIO,
  REP_EXIT_RATIO,
  SENSOR_INTERVAL_MS,
  SMOOTHNESS_JERK_SCALE,
} from '../utils/constants';
import { averageSmoothness, calculateROM, computeRepMetrics } from '../utils/gyroProcessing';
import { usePrescription } from '../utils/prescription';
import { playCeilingWarning, playTargetReached, stopCeilingWarning } from '../utils/soundManager';
import { saveSession, updateSession } from '../utils/storage';
import { TOKEN_KEY, uploadSession } from '../api/client';
import { useTheme } from '../theme/ThemeContext';

const SAMPLING_INTERVAL_SEC = SENSOR_INTERVAL_MS / 1000;

export default function ExerciseSession({ navigation, route }) {
  const exercise = EXERCISES[route.params?.exercise] || EXERCISES.forearm_supination;
  const { colors } = useTheme();
  const { rx: prescription, status: prescriptionStatus } = usePrescription(exercise);
  const [state, setState] = useState('instructions');
  const [countdown, setCountdown] = useState(10);
  const [angle, setAngle] = useState(0);
  const [reps, setReps] = useState(0);
  const [result, setResult] = useState(null);
  const [note, setNote] = useState('');
  const [pain, setPain] = useState(null);
  const [ceilingWarning, setCeilingWarning] = useState(false);
  const [sensorError, setSensorError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const repsRef = useRef(0);
  const readingsRef = useRef([]);
  const angleTraceRef = useRef([]);
  const repEndIndicesRef = useRef([]);
  const angleRef = useRef(0);
  const peakRef = useRef(0);
  const ceilingHitsRef = useRef(0);
  const ceilingActiveRef = useRef(false);
  const repReadyRef = useRef(false);
  const targetReachedRef = useRef(false);

  useEffect(() => {
    setState('instructions');
    setCountdown(10);
    setAngle(0);
    setReps(0);
    repsRef.current = 0;
    setResult(null);
    setNote('');
    setPain(null);
    setCeilingWarning(false);
    setSaveMessage('');
    readingsRef.current = [];
    angleTraceRef.current = [];
    repEndIndicesRef.current = [];
    angleRef.current = 0;
    peakRef.current = 0;
    ceilingHitsRef.current = 0;
    ceilingActiveRef.current = false;
    repReadyRef.current = false;
    targetReachedRef.current = false;
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
    angleRef.current += z * SAMPLING_INTERVAL_SEC * (180 / Math.PI);
    const currentAngle = Math.abs(angleRef.current);
    angleTraceRef.current.push(angleRef.current);
    setAngle(Math.round(currentAngle));

    if (currentAngle > peakRef.current) peakRef.current = currentAngle;

    // Zone sound: gentle "ding" exactly once when the target ROM is reached
    // (PulihGo soundManager — a positive cue, never a score).
    if (!targetReachedRef.current && currentAngle >= prescription.targetRomDeg) {
      targetReachedRef.current = true;
      playTargetReached();
    }

    // Rep thresholds are derived from the prescription target (PulihGo
    // repDetector.ts): enter at 45%, count once returned below 18%.
    const enterDeg = Math.max(prescription.targetRomDeg * REP_ENTER_RATIO, 5);
    const exitDeg = Math.max(prescription.targetRomDeg * REP_EXIT_RATIO, 2);
    if (currentAngle >= enterDeg) repReadyRef.current = true;
    if (repReadyRef.current && currentAngle <= exitDeg) {
      repReadyRef.current = false;
      repEndIndicesRef.current.push(angleTraceRef.current.length);
      setReps((current) => {
        const next = Math.min(prescription.targetReps, current + 1);
        repsRef.current = next;
        if (next >= prescription.targetReps) setTimeout(stopRecording, 0);
        return next;
      });
    }

    // Safety: warn (never reward) when ROM exceeds the ceiling. The warning
    // tone loops while over, and stops once back in the safe zone.
    const pastCeiling = currentAngle > prescription.romCeilingDeg;
    if (pastCeiling && !ceilingActiveRef.current) {
      ceilingActiveRef.current = true;
      ceilingHitsRef.current += 1;
      setCeilingWarning(true);
      playCeilingWarning();
    } else if (!pastCeiling && ceilingActiveRef.current) {
      ceilingActiveRef.current = false;
      setCeilingWarning(false);
      stopCeilingWarning();
    }
  }

  function stopRecording() {
    if (state !== 'recording') return;
    stopCeilingWarning();
    const rom = calculateROM(readingsRef.current, SAMPLING_INTERVAL_SEC);
    const repMetrics = computeRepMetrics(angleTraceRef.current, repEndIndicesRef.current, SAMPLING_INTERVAL_SEC, SMOOTHNESS_JERK_SCALE);
    const smoothness = averageSmoothness(repMetrics, angleTraceRef.current, SMOOTHNESS_JERK_SCALE);
    setResult({
      ...rom,
      repsCompleted: repsRef.current,
      avgSmoothness: smoothness,
      ceilingHits: ceilingHitsRef.current,
      perReps: repMetrics,
    });
    setState('summary');
  }

  async function handleSave() {
    if (!pain) return;
    try {
      const storedSession = await saveSession({
        date: new Date().toISOString(),
        exercise: exercise.key,
        peakRom: result.peakRom,
        avgRom: result.avgRom,
        repsCompleted: result.repsCompleted,
        consistency: result.consistency,
        pain,
        avgSmoothness: result.avgSmoothness,
        ceilingHits: result.ceilingHits,
        prescriptionSource: prescription.source,
        notes: note.trim(),
        gyroRawSampleCount: readingsRef.current.length,
        perReps: result.perReps,
      });
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const uploaded = await uploadSession(storedSession, token);
          await updateSession(storedSession.id, { pending: false, serverId: uploaded.id, syncedAt: new Date().toISOString() });
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
    setPain(null);
    setState('instructions');
    readingsRef.current = [];
    angleTraceRef.current = [];
    repEndIndicesRef.current = [];
    setReps(0);
    repsRef.current = 0;
    ceilingHitsRef.current = 0;
    setCeilingWarning(false);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Exercise name header bar */}
      <View style={styles.headerBar}>
        <View style={[styles.headerDot, { backgroundColor: colors.accent }]} />
        <Text style={[styles.exerciseName, { color: colors.text }]} numberOfLines={1}>
          {exercise.name}
        </Text>
      </View>

      <View style={styles.container}>
        {state === 'instructions' && (
          <Instructions colors={colors} prescription={prescription} status={prescriptionStatus} exercise={exercise} onStart={startCalibration} />
        )}
        {state === 'calibration' && <Calibration colors={colors} countdown={countdown} onCancel={() => navigation.navigate('Exercises')} />}
        {state === 'recording' && (
          <Recording
            colors={colors}
            angle={angle}
            ceilingWarning={ceilingWarning}
            exercise={exercise}
            prescription={prescription}
            reps={reps}
            onStop={stopRecording}
          />
        )}
        {state === 'summary' && result && (
          <SessionSummary
            colors={colors}
            pain={pain}
            onPainChange={setPain}
            result={result}
            targetReps={prescription.targetReps}
            note={note}
            onNoteChange={setNote}
          />
        )}
        {sensorError ? <Text style={[styles.error, { color: colors.danger }]}>{sensorError}</Text> : null}
        {saveMessage ? (
          <View style={styles.savedBanner}>
            <Text style={styles.savedText}>✓ {saveMessage}</Text>
          </View>
        ) : null}
        {state === 'recording' && (
          <GyroSensor active onError={() => setSensorError('Sensor gerak tidak tersedia di perangkat ini.')} onReading={handleReading} />
        )}
        {state === 'summary' && result && (
          <View style={styles.actions}>
            <PrimaryButton colors={colors} disabled={!pain} label="Simpan Sesi" onPress={handleSave} />
            <Pressable accessibilityRole="button" onPress={redo} style={styles.secondaryButton}>
              <Text style={[styles.secondaryLabel, { color: colors.warn }]}>🔄 Ulangi latihan</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function Instructions({ exercise, prescription, status, colors, onStart }) {
  const targetLabel = prescription.source === 'default' ? 'Default' : 'Dari terapis';
  return (
    <View style={styles.instructionsWrap}>
      {/* Instruction card */}
      <View style={styles.instructionCard}>
        <Text style={styles.instructionCardLabel}>📋 CARA LATIHAN</Text>
        <Text style={[styles.helper, { color: colors.body }]}>{exercise.instruction}</Text>
      </View>

      {/* Prescription info */}
      <View style={styles.rxRow}>
        <View style={styles.rxItem}>
          <Text style={styles.rxIcon}>🎯</Text>
          <Text style={[styles.rxValue, { color: colors.accentDark }]}>{prescription.targetRomDeg}°</Text>
          <Text style={styles.rxLabel}>Target ROM{status === 'loading' ? ' (memuat...)' : ` (${targetLabel})`}</Text>
        </View>
        <View style={styles.rxDivider} />
        <View style={styles.rxItem}>
          <Text style={styles.rxIcon}>🛡️</Text>
          <Text style={[styles.rxValue, { color: '#A32D2D' }]}>{prescription.romCeilingDeg}°</Text>
          <Text style={styles.rxLabel}>Batas aman</Text>
        </View>
        <View style={styles.rxDivider} />
        <View style={styles.rxItem}>
          <Text style={styles.rxIcon}>🔄</Text>
          <Text style={[styles.rxValue, { color: colors.accentDark }]}>{prescription.targetReps}</Text>
          <Text style={styles.rxLabel}>Target rep</Text>
        </View>
      </View>

      <View style={styles.safetyNote}>
        <Text style={styles.safetyNoteText}>⚠️ Hentikan segera jika terasa sakit atau tidak nyaman.</Text>
      </View>

      <PrimaryButton colors={colors} label="Mulai Kalibrasi" onPress={onStart} />
    </View>
  );
}

function Calibration({ colors, countdown, onCancel }) {
  return (
    <View style={styles.center}>
      {/* Countdown ring */}
      <View style={[styles.countdownRing, { borderColor: colors.accent }]}>
        <Text style={[styles.countdown, { color: colors.accentDark }]}>{countdown}</Text>
        <Text style={[styles.countdownSub, { color: colors.body }]}>detik</Text>
      </View>
      <Text style={[styles.helper, { color: colors.body, textAlign: 'center', marginTop: 24 }]}>
        Tahan ponsel dalam posisi diam selama kalibrasi.
      </Text>
      <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancelBtn}>
        <Text style={[styles.cancel, { color: colors.body }]}>Batal</Text>
      </Pressable>
    </View>
  );
}

function Recording({ colors, angle, ceilingWarning, exercise, prescription, reps, onStop }) {
  const progress = Math.min(angle / prescription.targetRomDeg, 1);
  const isNearTarget = progress >= 0.8;
  const isOverCeiling = ceilingWarning;
  const gaugeColor = isOverCeiling ? '#A32D2D' : isNearTarget ? '#D85A30' : colors.accent;

  return (
    <View style={styles.center}>
      {/* Gauge */}
      <View style={[styles.gauge, { borderColor: gaugeColor, shadowColor: gaugeColor }]}>
        <Text style={[styles.angle, { color: colors.text }]}>{angle}</Text>
        <Text style={styles.angleDeg}>°</Text>
        <Text style={[styles.gaugeLabel, { color: colors.body }]}>dari {prescription.targetRomDeg}°</Text>

        {/* Progress indicator bar inside gauge */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(progress * 100, 100)}%`,
                backgroundColor: gaugeColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Rep counter */}
      <View style={styles.repRow}>
        <Text style={[styles.repNum, { color: colors.text }]}>{reps}</Text>
        <Text style={[styles.repSlash, { color: colors.body }]}> / {prescription.targetReps}</Text>
        <Text style={[styles.repLabel, { color: colors.body }]}> rep</Text>
      </View>

      {/* Ceiling warning */}
      {isOverCeiling ? (
        <View style={styles.ceilingBanner}>
          <Text style={styles.ceilingBannerText}>⚠️ Melebihi batas aman — kembalikan perlahan</Text>
        </View>
      ) : (
        <Text style={[styles.helper, { color: colors.body, textAlign: 'center' }]}>Gerakkan perlahan dan tetap nyaman.</Text>
      )}

      <PrimaryButton colors={colors} label="Selesai" onPress={onStop} />
    </View>
  );
}
