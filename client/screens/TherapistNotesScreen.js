import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNotes, TOKEN_KEY } from '../api/client';
import { useTheme } from '../theme/ThemeContext';

const TEMPLATE_LABELS = {
  continue: 'Lanjutkan latihan',
  reduce_target: 'Kurangi target sementara',
  follow_up: 'Perlu tindak lanjut',
};

export default function TherapistNotesScreen() {
  const { colors } = useTheme();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadNotes = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Sesi berakhir');
      setNotes(await fetchNotes(token));
    } catch (requestError) {
      console.error('Failed to load therapist notes:', requestError);
      setError('Catatan terapis belum dapat dimuat.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadNotes();
  }, [loadNotes]));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            onRefresh={() => loadNotes(true)}
            refreshing={refreshing}
            tintColor={colors.accent}
          />
        )}
      >
        <Text style={[styles.title, { color: colors.text }]}>Catatan Terapis</Text>
        <Text style={[styles.subtitle, { color: colors.body }]}>
          Arahan dan evaluasi mingguan dari terapis Anda.
        </Text>

        {loading ? <ActivityIndicator color={colors.accent} style={styles.loader} /> : null}

        {error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.warnSoft, borderColor: colors.warn }]}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => loadNotes()}
              style={[styles.retryButton, { borderColor: colors.accent }]}
            >
              <Text style={[styles.retryText, { color: colors.accent }]}>Coba lagi</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && notes.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.line }]}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada catatan</Text>
            <Text style={[styles.emptyText, { color: colors.body }]}>
              Catatan mingguan dari terapis akan muncul di sini.
            </Text>
          </View>
        ) : null}

        {notes.map((note) => (
          <View
            key={note.id}
            style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.line }]}
          >
            <View style={styles.noteHeader}>
              <Text style={[styles.week, { color: colors.accentDark }]}>Minggu {note.weekNumber}</Text>
              <Text style={[styles.date, { color: colors.muted }]}>
                {new Date(note.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>

            {note.therapist?.name ? (
              <Text style={[styles.therapist, { color: colors.body }]}>{note.therapist.name}</Text>
            ) : null}

            <Text style={[styles.noteText, { color: colors.text }]}>{note.note}</Text>

            {note.templateKey && TEMPLATE_LABELS[note.templateKey] ? (
              <View style={[styles.templateBadge, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.templateText, { color: colors.accentDark }]}>
                  {TEMPLATE_LABELS[note.templateKey]}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 6 },
  loader: { marginTop: 40 },

  errorCard: {
    borderRadius: 14, borderWidth: 1, marginTop: 24, padding: 16,
  },
  errorText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  retryButton: {
    alignSelf: 'flex-start', borderRadius: 100, borderWidth: 1.5,
    marginTop: 12, paddingHorizontal: 16, paddingVertical: 8,
  },
  retryText: { fontSize: 13, fontWeight: '700' },

  empty: {
    alignItems: 'center', borderRadius: 18, borderWidth: 1,
    marginTop: 24, padding: 28,
  },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyText: { fontSize: 14, lineHeight: 21, marginTop: 6, textAlign: 'center' },

  noteCard: {
    borderRadius: 18, borderWidth: 1, marginTop: 16, padding: 18,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  noteHeader: {
    alignItems: 'center', flexDirection: 'row',
    justifyContent: 'space-between',
  },
  week: { fontSize: 15, fontWeight: '800' },
  date: { fontSize: 12, fontWeight: '600' },
  therapist: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  noteText: { fontSize: 15, lineHeight: 23, marginTop: 12 },
  templateBadge: {
    alignSelf: 'flex-start', borderRadius: 100,
    marginTop: 12, paddingHorizontal: 10, paddingVertical: 5,
  },
  templateText: { fontSize: 11, fontWeight: '700' },
});
