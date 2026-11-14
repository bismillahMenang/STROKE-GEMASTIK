import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, StatusBar } from 'react-native';
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
      <StatusBar barStyle="dark-content" backgroundColor="#F2F1ED" />

      {/* Decorative teal arc at top */}
      <View style={styles.topDecoration}>
        <View style={styles.arcOuter} />
        <View style={styles.arcInner} />
      </View>

      <View style={styles.container}>
        {/* Logo badge */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoInitials}>RT</Text>
        </View>
        <Text style={styles.brand}>RehabTrack</Text>
        <Text style={styles.title}>Latihan lebih terarah{'\n'}di rumah</Text>
        <Text style={styles.subtitle}>Pantau gerakan Anda bersama terapis.</Text>

        {/* Toggle */}
        <View style={styles.toggle}>
          <ToggleButton active={mode === 'login'} label={t('login')} onPress={() => toggle('login')} />
          <ToggleButton active={mode === 'register'} label={t('register')} onPress={() => toggle('register')} />
        </View>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          {mode === 'register' ? (
            <TextInput
              autoCapitalize="words"
              placeholder="Nama lengkap"
              placeholderTextColor="#9B9992"
              style={styles.input}
              value={form.name}
              onChangeText={(value) => change('name', value)}
            />
          ) : null}
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#9B9992"
            style={styles.input}
            value={form.email}
            onChangeText={(value) => change('email', value)}
          />
          {mode === 'register' ? (
            <TextInput
              keyboardType="phone-pad"
              placeholder="Nomor telepon (opsional)"
              placeholderTextColor="#9B9992"
              style={styles.input}
              value={form.phone}
              onChangeText={(value) => change('phone', value)}
            />
          ) : null}
          <TextInput
            secureTextEntry
            placeholder="Kata sandi"
            placeholderTextColor="#9B9992"
            style={styles.input}
            value={form.password}
            onChangeText={(value) => change('password', value)}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={submit}
          style={({ pressed }) => [styles.button, loading && styles.disabled, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonLabel}>
            {loading ? 'Memproses...' : mode === 'login' ? t('login') : t('register')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ToggleButton({ active, label, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.toggleButton, active && styles.toggleActive]}>
      <Text style={[styles.toggleLabel, active && styles.toggleActiveLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F2F1ED', flex: 1 },

  // Decorative top shapes
  topDecoration: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, overflow: 'hidden' },
  arcOuter: {
    position: 'absolute', top: -80, left: -60, width: 280, height: 280,
    borderRadius: 140, backgroundColor: 'rgba(15,158,117,0.12)',
  },
  arcInner: {
    position: 'absolute', top: -110, right: -30, width: 200, height: 200,
    borderRadius: 100, backgroundColor: 'rgba(8,80,65,0.08)',
  },

  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 24 },

  // Logo
  logoBadge: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: '#0F9E75', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0F9E75', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  logoInitials: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },

  brand: { color: '#0F9E75', fontSize: 14, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  title: { color: '#1E1E1C', fontSize: 28, fontWeight: '700', lineHeight: 36 },
  subtitle: { color: '#5C5B57', fontSize: 16, lineHeight: 24, marginTop: 8 },

  // Toggle switch
  toggle: {
    backgroundColor: '#E4E2D9', borderRadius: 14, flexDirection: 'row',
    marginTop: 28, padding: 4,
  },
  toggleButton: { alignItems: 'center', borderRadius: 10, flex: 1, minHeight: 46, justifyContent: 'center' },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  toggleLabel: { color: '#6B6A66', fontSize: 15, fontWeight: '600' },
  toggleActiveLabel: { color: '#085041', fontWeight: '700' },

  // Inputs
  inputGroup: { marginTop: 20, gap: 12 },
  input: {
    backgroundColor: '#FFFFFF', borderColor: '#E0DED5', borderRadius: 14,
    borderWidth: 1.5, color: '#1E1E1C', fontSize: 16, minHeight: 54,
    paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },

  error: { color: '#A32D2D', fontSize: 14, lineHeight: 20, marginTop: 12, fontWeight: '500' },

  // CTA Button
  button: {
    alignItems: 'center', backgroundColor: '#0F9E75', borderRadius: 100,
    justifyContent: 'center', minHeight: 56, marginTop: 24,
    shadowColor: '#0F9E75', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 6,
  },
  buttonPressed: { transform: [{ scale: 0.975 }], opacity: 0.9 },
  disabled: { opacity: 0.45, shadowOpacity: 0 },
  buttonLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});
