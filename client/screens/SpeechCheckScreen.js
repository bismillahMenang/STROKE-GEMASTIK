import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioStream } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { extractSpeechFeatures, inferSpeechClarity } from '../utils/audioProcessing';
import { saveAssessment, updateAssessment } from '../utils/assessmentStorage';
import { TOKEN_KEY, uploadAssessment } from '../api/client';

export default function SpeechCheckScreen({ navigation }) {
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(10);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const recordingRef = useRef(false);
  const samplesRef = useRef([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);
  const handleBuffer = useCallback((buffer) => { if (recordingRef.current) samplesRef.current.push(...new Float32Array(buffer.data)); }, []);
  const { stream } = useAudioStream({ channels: 1, encoding: 'float32', onBuffer: handleBuffer, sampleRate: 16000 });

  useEffect(() => () => { clearInterval(timerRef.current); if (recordingRef.current) stream.stop(); }, [stream]);

  async function start() {
    setError(''); setResult(null);
    if (!consent) { setError('Persetujuan diperlukan sebelum mikrofon digunakan.'); return; }
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) { setError('Izin mikrofon ditolak.'); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      samplesRef.current = []; startedAtRef.current = Date.now(); recordingRef.current = true; setRecording(true); setSeconds(10); await stream.start();
      timerRef.current = setInterval(() => { const remaining = Math.max(0, 10 - Math.floor((Date.now() - startedAtRef.current) / 1000)); setSeconds(remaining); if (!remaining) finish(); }, 250);
    } catch (startError) { console.error('Speech recording failed:', startError); recordingRef.current = false; setRecording(false); setError('Perekaman belum dapat dimulai.'); }
  }

  async function finish() {
    if (!recordingRef.current) return;
    clearInterval(timerRef.current); recordingRef.current = false; setRecording(false); stream.stop();
    try { const features = extractSpeechFeatures(samplesRef.current, 16000); const analysis = await inferSpeechClarity(features); if (!analysis) throw new Error('Insufficient audio samples'); setResult(analysis); } catch (analysisError) { console.error('Speech analysis failed:', analysisError); setError('Sinyal bicara belum cukup untuk dianalisis.'); }
  }

  async function save() {
    const saved = await saveAssessment({ date: new Date().toISOString(), type: 'speech_clarity', score: result.clarityScore, risk: result.risk, modelVersion: result.modelVersion, consentedAt: new Date().toISOString() });
    try { const token = await AsyncStorage.getItem(TOKEN_KEY); if (token) { const uploaded = await uploadAssessment(saved, token); await updateAssessment(saved.id, { pending: false, serverId: uploaded._id }); } } catch (uploadError) { console.error('Speech assessment upload deferred:', uploadError.message); }
    navigation.navigate('Progress');
  }

  return <SafeAreaView style={styles.safe}><View style={styles.container}><Text style={styles.title}>Pemeriksaan kejelasan bicara</Text><Text style={styles.helper}>Bacakan kalimat: “Saya ingin berlatih dengan tenang hari ini.” Perekaman berlangsung 10 detik.</Text><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: consent }} onPress={() => setConsent((current) => !current)} style={styles.consent}><Text style={styles.checkbox}>{consent ? '☑' : '☐'}</Text><Text style={styles.consentText}>Saya menyetujui penggunaan mikrofon untuk pemeriksaan ini. Audio mentah diproses di perangkat dan tidak disimpan.</Text></Pressable>{recording ? <View style={styles.timer}><Text style={styles.timerValue}>{seconds}</Text><Text style={styles.helper}>Silakan terus berbicara...</Text></View> : result ? <View style={styles.result}><Text style={styles.resultValue}>{Math.round(result.clarityScore * 100)}%</Text><Text style={styles.resultLabel}>skor kejelasan · risiko {result.risk === 'low' ? 'rendah' : result.risk === 'medium' ? 'sedang' : 'tinggi'}</Text><Text style={styles.disclaimer}>Sinyal tambahan untuk terapis, bukan diagnosis.</Text></View> : null}{error ? <Text style={styles.error}>{error}</Text> : null}{recording ? <Pressable accessibilityRole="button" onPress={finish} style={styles.primary}><Text style={styles.primaryLabel}>Selesai</Text></Pressable> : result ? <Pressable accessibilityRole="button" onPress={save} style={styles.primary}><Text style={styles.primaryLabel}>Simpan hasil</Text></Pressable> : <Pressable accessibilityRole="button" onPress={start} style={[styles.primary, !consent && styles.disabled]}><Text style={styles.primaryLabel}>Mulai pemeriksaan</Text></Pressable>}<Pressable onPress={() => navigation.goBack()} style={styles.secondary}><Text style={styles.secondaryLabel}>Kembali</Text></Pressable></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#F7F6F2', flex: 1 },
  container: { flex: 1, padding: 20 },
  title: { color: '#2C2C2A', fontSize: 24, fontWeight: '600' },
  helper: { color: '#5F5E5A', fontSize: 16, lineHeight: 24, marginTop: 10 },
  consent: { alignItems: 'flex-start', flexDirection: 'row', marginTop: 24, minHeight: 48 },
  checkbox: { color: '#185FA5', fontSize: 24, marginRight: 10 },
  consentText: { color: '#2C2C2A', flex: 1, fontSize: 15, lineHeight: 22 },
  timer: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 24, padding: 24 },
  timerValue: { color: '#185FA5', fontSize: 56, fontWeight: '700' },
  result: { backgroundColor: '#FFFFFF', borderColor: '#D3D1C7', borderRadius: 12, borderWidth: 1, marginTop: 24, padding: 16 },
  resultValue: { color: '#185FA5', fontSize: 36, fontWeight: '700' },
  resultLabel: { color: '#2C2C2A', fontSize: 16, marginTop: 4 },
  disclaimer: { color: '#888780', fontSize: 14, lineHeight: 20, marginTop: 10 },
  error: { color: '#A32D2D', fontSize: 15, lineHeight: 22, marginTop: 12 },
  primary: { alignItems: 'center', backgroundColor: '#185FA5', borderRadius: 8, justifyContent: 'center', minHeight: 50, marginTop: 24 },
  disabled: { opacity: 0.4 },
  primaryLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondary: { alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: 8 },
  secondaryLabel: { color: '#185FA5', fontSize: 16, fontWeight: '600' },
});
