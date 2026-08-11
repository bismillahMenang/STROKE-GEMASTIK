import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { login, registerPatient, PATIENT_KEY, TOKEN_KEY } from '../api/client';
import { t } from '../i18n';

export default function AuthScreen({ onAuthenticated, initialMessage = '' }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState(initialMessage);
  const [loading, setLoading] = useState(false);

  function change(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function toggle(nextMode) { setMode(nextMode); setForm({ name: '', email: '', phone: '', password: '' }); setError(''); }

  async function submit() {
    setError('');
    if (!form.email || !form.password || (mode === 'register' && !form.name)) {
      setError('Mohon lengkapi data yang diperlukan.');
      return;
    }
    setLoading(true);
    try {
      const result = mode === 'register'
        ? await registerPatient(form)
        : await login(form.email, form.password);
      await AsyncStorage.multiSet([[TOKEN_KEY, result.token], [PATIENT_KEY, JSON.stringify(result.patient || {})]]);
      onAuthenticated(result.token);
    } catch (requestError) {
      console.error('Authentication failed:', requestError);
      setError(requestError.response?.data?.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.brand}>{t('appName')}</Text>
        <Text style={styles.title}>Latihan lebih terarah di rumah</Text>
        <Text style={styles.subtitle}>Pantau gerakan Anda bersama terapis.</Text>
        <View style={styles.toggle}><ToggleButton active={mode === 'login'} label={t('login')} onPress={() => toggle('login')} /><ToggleButton active={mode === 'register'} label={t('register')} onPress={() => toggle('register')} /></View>
        {mode === 'register' ? <TextInput autoCapitalize="words" placeholder="Nama lengkap" placeholderTextColor="#888780" style={styles.input} value={form.name} onChangeText={(value) => change('name', value)} /> : null}
        <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor="#888780" style={styles.input} value={form.email} onChangeText={(value) => change('email', value)} />
        {mode === 'register' ? <TextInput keyboardType="phone-pad" placeholder="Nomor telepon (opsional)" placeholderTextColor="#888780" style={styles.input} value={form.phone} onChangeText={(value) => change('phone', value)} /> : null}
        <TextInput secureTextEntry placeholder="Kata sandi" placeholderTextColor="#888780" style={styles.input} value={form.password} onChangeText={(value) => change('password', value)} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" disabled={loading} onPress={submit} style={[styles.button, loading && styles.disabled]}><Text style={styles.buttonLabel}>{loading ? 'Memproses...' : mode === 'login' ? t('login') : t('register')}</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

function ToggleButton({ active, label, onPress }) { return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.toggleButton, active && styles.toggleActive]}><Text style={[styles.toggleLabel, active && styles.toggleActiveLabel]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F6F2', flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  brand: { color: '#0F9E75', fontSize: 18, fontWeight: '700' },
  title: { color: '#2C2C2A', fontSize: 26, fontWeight: '600', lineHeight: 34, marginTop: 12 },
  subtitle: { color: '#5F5E5A', fontSize: 16, lineHeight: 24, marginTop: 8 },
  toggle: { backgroundColor: '#E7E5DE', borderRadius: 8, flexDirection: 'row', marginTop: 28, padding: 4 },
  toggleButton: { alignItems: 'center', borderRadius: 6, flex: 1, minHeight: 44, justifyContent: 'center' },
  toggleActive: { backgroundColor: '#FFFFFF' },
  toggleLabel: { color: '#5F5E5A', fontSize: 16, fontWeight: '600' },
  toggleActiveLabel: { color: '#085041' },
  input: { backgroundColor: '#FFFFFF', borderColor: '#D3D1C7', borderRadius: 8, borderWidth: 1, color: '#2C2C2A', fontSize: 16, minHeight: 50, marginTop: 12, paddingHorizontal: 14 },
  error: { color: '#A32D2D', fontSize: 15, lineHeight: 22, marginTop: 12 },
  button: { alignItems: 'center', backgroundColor: '#0F9E75', borderRadius: 8, justifyContent: 'center', minHeight: 52, marginTop: 20 },
  disabled: { opacity: 0.4 },
  buttonLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
