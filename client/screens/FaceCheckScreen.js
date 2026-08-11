import { useCallback, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import FaceDetectorBridge from '../utils/faceDetector';
import { asymmetryRisk, calculateAsymmetryScore } from '../utils/faceMetrics';
import { saveAssessment, updateAssessment } from '../utils/assessmentStorage';
import { TOKEN_KEY, uploadAssessment } from '../api/client';

export default function FaceCheckScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState('');
  const [score, setScore] = useState(null);
  const [risk, setRisk] = useState('unknown');
  const [processing, setProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');

  const handleDetected = useCallback(async (landmarks) => {
    const nextScore = calculateAsymmetryScore(landmarks);
    if (nextScore === null) { setError('Wajah belum terdeteksi dengan cukup jelas. Coba ambil foto ulang.'); setProcessing(false); return; }
    setScore(nextScore);
    setRisk(asymmetryRisk(nextScore));
    setProcessing(false);
  }, []);
  const handleDetectionError = useCallback((detectionError) => { console.error('Face detection failed:', detectionError); setProcessing(false); setError('Pemeriksaan wajah belum dapat dilakukan di perangkat ini.'); }, []);

  async function capture() {
    if (!cameraReady) { setError('Kamera masih disiapkan.'); return; }
    setError(''); setScore(null); setProcessing(true);
    try { const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, skipProcessing: false }); setPhotoUri(photo.uri); } catch (captureError) { console.error('Face photo capture failed:', captureError); setProcessing(false); setError('Foto belum dapat diambil.'); }
  }

  async function save() {
    const assessment = { date: new Date().toISOString(), type: 'facial_asymmetry', score, risk, modelVersion: 'phase2-face-landmarks-0.1' };
    const saved = await saveAssessment(assessment);
    try { const token = await AsyncStorage.getItem(TOKEN_KEY); if (token) { const uploaded = await uploadAssessment(saved, token); await updateAssessment(saved.id, { pending: false, serverId: uploaded._id }); } } catch (uploadError) { console.error('Face assessment upload deferred:', uploadError.message); }
    navigation.navigate('Progress');
  }

  if (!permission) return <SafeAreaView style={styles.safe}><Text style={styles.helper}>Memuat izin kamera...</Text></SafeAreaView>;
  if (!permission.granted) return <SafeAreaView style={styles.safe}><View style={styles.container}><Text style={styles.title}>Pemeriksaan simetri wajah</Text><Text style={styles.helper}>Kamera diproses di perangkat untuk memperkirakan simetri wajah. Hasil ini bukan diagnosis.</Text><Pressable accessibilityRole="button" onPress={requestPermission} style={styles.primary}><Text style={styles.primaryLabel}>Izinkan kamera</Text></Pressable><Pressable onPress={() => navigation.goBack()} style={styles.secondary}><Text style={styles.secondaryLabel}>Kembali</Text></Pressable></View></SafeAreaView>;

  return <SafeAreaView style={styles.safe}><View style={styles.container}><Text style={styles.title}>Pemeriksaan simetri wajah</Text><Text style={styles.helper}>Posisikan wajah di tengah, lalu tersenyum lembut saat mengambil foto.</Text>{photoUri ? <Image source={{ uri: photoUri }} style={styles.preview} /> : <CameraView facing="front" onCameraReady={() => setCameraReady(true)} ref={cameraRef} style={styles.camera} />}{photoUri ? <FaceDetectorBridge onDetected={handleDetected} onError={handleDetectionError} uri={photoUri} /> : null}{processing ? <Text style={styles.helper}>Menganalisis secara lokal...</Text> : null}{score !== null ? <View style={styles.result}><Text style={styles.resultValue}>{Math.round(score * 100)}%</Text><Text style={styles.resultLabel}>skor asimetri · {risk === 'low' ? 'rendah' : risk === 'medium' ? 'sedang' : 'tinggi'}</Text><Text style={styles.disclaimer}>Sinyal tambahan untuk terapis, bukan diagnosis.</Text></View> : null}{error ? <Text style={styles.error}>{error}</Text> : null}{!photoUri ? <Pressable accessibilityRole="button" disabled={!cameraReady} onPress={capture} style={[styles.primary, !cameraReady && styles.disabled]}><Text style={styles.primaryLabel}>{cameraReady ? 'Ambil foto' : 'Menyiapkan kamera...'}</Text></Pressable> : score !== null ? <Pressable accessibilityRole="button" onPress={save} style={styles.primary}><Text style={styles.primaryLabel}>Simpan hasil</Text></Pressable> : <Pressable accessibilityRole="button" onPress={() => { setPhotoUri(''); setCameraReady(false); setError(''); }} style={styles.secondary}><Text style={styles.secondaryLabel}>Ambil ulang</Text></Pressable>}<Pressable onPress={() => navigation.goBack()} style={styles.secondary}><Text style={styles.secondaryLabel}>Kembali</Text></Pressable></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#F7F6F2', flex: 1 },
  container: { flex: 1, padding: 20 },
  title: { color: '#2C2C2A', fontSize: 24, fontWeight: '600' },
  helper: { color: '#5F5E5A', fontSize: 16, lineHeight: 24, marginTop: 10 },
  camera: { borderRadius: 12, flex: 1, marginTop: 20, minHeight: 300, overflow: 'hidden' },
  preview: { borderRadius: 12, flex: 1, marginTop: 20, minHeight: 300 },
  result: { backgroundColor: '#FFFFFF', borderColor: '#D3D1C7', borderRadius: 12, borderWidth: 1, marginTop: 16, padding: 16 },
  resultValue: { color: '#185FA5', fontSize: 36, fontWeight: '700' },
  resultLabel: { color: '#2C2C2A', fontSize: 16, marginTop: 4 },
  disclaimer: { color: '#888780', fontSize: 14, lineHeight: 20, marginTop: 10 },
  error: { color: '#A32D2D', fontSize: 15, lineHeight: 22, marginTop: 12 },
  primary: { alignItems: 'center', backgroundColor: '#185FA5', borderRadius: 8, justifyContent: 'center', minHeight: 50, marginTop: 18 },
  disabled: { opacity: 0.45 },
  primaryLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondary: { alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: 8 },
  secondaryLabel: { color: '#185FA5', fontSize: 16, fontWeight: '600' },
});
