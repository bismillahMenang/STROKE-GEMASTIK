import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import ROMChart from '../components/ROMChart';
import SessionCard from '../components/SessionCard';
import styles from '../components/progressDashboardStyles';
import { EXERCISE_LIST, EXERCISES, THERAPIST_CALL_LINK } from '../utils/constants';
import { getSessions, saveSession } from '../utils/storage';
import { fetchSessions, TOKEN_KEY } from '../api/client';
import { computeStreak, totalReps, bestRomDeg, dayKey } from '../utils/streak';
import { summarizeExerciseSessions } from '../utils/progressMetrics';
import { useTheme } from '../theme/ThemeContext';

const DAY_LETTERS = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function getWeekDays(anchorMs) {
  const current = new Date(anchorMs);
  const dayOfWeek = current.getDay();
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(current);
  monday.setDate(current.getDate() + distanceToMonday);
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function ProgressDashboard({ navigation }) {
  const { colors, theme, toggleTheme } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [exerciseKey, setExerciseKey] = useState(EXERCISE_LIST[0].key);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(Date.now());
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState('');
  const pendingCount = sessions.filter((session) => session.pending).length;
  const streak = computeStreak(sessions);
  const repTotal = totalReps(sessions);
  const bestRom = bestRomDeg(sessions);
  const exercise = EXERCISES[exerciseKey] || EXERCISE_LIST[0];

  useFocusEffect(useCallback(() => {
    let active = true;
    getSessions().then((items) => {
      if (!active) return;
      setSessions(items);
      // Reconcile: if the device was wiped but the server still has the
      // patient's history, restore it locally (PulihGo ProgressScreen).
      restoreFromServer(items, active);
    }).catch((err) => {
      console.error('Failed to load progress:', err);
      if (active) setError('Riwayat latihan belum dapat dimuat.');
    });
    return () => { active = false; };
  }, []));

  async function restoreFromServer(localSessions, active) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token || localSessions.length > 0) return;
    try {
      const serverSessions = await fetchSessions(token);
      if (active && serverSessions.length > 0) {
        const restored = [];
        for (const s of serverSessions) {
          restored.push(await saveSession({
            id: `srv-${s.id}`,
            serverId: s.id,
            date: s.date,
            exercise: s.exercise,
            peakRom: s.peakRom,
            avgRom: s.avgRom,
            repsCompleted: s.repsCompleted,
            consistency: s.consistency,
            pain: s.pain,
            avgSmoothness: s.avgSmoothness,
            ceilingHits: s.ceilingHits,
            notes: s.notes,
            pending: false,
          }));
        }
        setSessions(restored);
      }
    } catch (err) {
      console.warn('Server reconcile skipped:', err.message);
    }
  }

  async function callTherapist() {
    if (!THERAPIST_CALL_LINK) {
      setError('Tautan panggilan belum dikonfigurasi. Hubungi admin atau terapis Anda.');
      return;
    }
    try { await Linking.openURL(THERAPIST_CALL_LINK); } catch (err) { console.error('Unable to open therapist link:', err); setError('Tautan panggilan belum dapat dibuka.'); }
  }

  const selectedKey = dayKey(selectedDate);
  const isSelectedToday = selectedKey === dayKey(Date.now());
  const daySessions = sessions.filter((session) => dayKey(new Date(session.date)) === selectedKey);
  const weekDays = getWeekDays(selectedDate);

  const hasPractice = daySessions.length > 0;
  const exerciseDay = summarizeExerciseSessions(daySessions, exerciseKey);
  const hasExercisePractice = exerciseDay.count > 0;
  const dayBestRom = exerciseDay.bestRom;
  const dayAvgSmoothness = exerciseDay.avgSmoothness;
  const romPercent = Math.min(100, Math.round((dayBestRom / exercise.targetRom) * 100));
  const smoothnessPercent = Math.round(dayAvgSmoothness * 100);

  // Coach insight (PulihGo ProgressScreen)
  let coachTitle = 'Siap berlatih';
  let coachMessage = hasPractice
    ? `Belum ada sesi ${exercise.name} pada hari ini.`
    : isSelectedToday ? 'Selesaikan satu sesi hari ini untuk memulai.' : 'Tidak ada latihan tercatat pada hari ini.';
  let coachColor = colors.accent;
  if (hasExercisePractice) {
    const worstStopped = exerciseDay.sessions.some((s) => s.pain === 'stopped');
    const worstMild = exerciseDay.sessions.some((s) => s.pain === 'mild');
    if (worstStopped) {
      coachTitle = 'Mendengarkan tubuh';
      coachMessage = 'Bagus berhenti saat tidak nyaman — istirahat adalah bagian dari pemulihan.';
      coachColor = colors.danger;
    } else if (worstMild) {
      coachTitle = 'Perhatikan nyeri';
      coachMessage = 'Ada nyeri ringan tercatat — lain kali kurangi jangkauan gerak.';
      coachColor = colors.caution;
    } else if (dayAvgSmoothness < 0.6) {
      coachTitle = 'Fokus kendali';
      coachMessage = 'Coba gerakan yang lebih pelan dan terkontrol pada sesi berikutnya.';
      coachColor = colors.caution;
    } else if (dayBestRom < exercise.targetRom * 0.75) {
      coachTitle = 'Membangun jangkauan';
      coachMessage = 'Terus berlatih untuk meningkatkan jangkauan gerak secara bertahap.';
      coachColor = colors.accent;
    } else {
      coachTitle = 'Sesi optimal';
      coachMessage = 'Luar biasa — gerakan yang lancar hari ini!';
      coachColor = colors.accent;
    }
  }

  // Today's effort (PulihGo rehab strain slider)
  let effortLabel = 'Kecepatan aman';
  let effortColor = colors.accent;
  let indicator = '15%';
  if (hasExercisePractice) {
    if (exerciseDay.sessions.some((s) => s.pain === 'stopped')) {
      effortLabel = 'Waktu istirahat';
      effortColor = colors.danger;
      indicator = '85%';
    } else if (exerciseDay.sessions.some((s) => s.pain === 'mild') || dayAvgSmoothness < 0.6 || dayBestRom < exercise.targetRom * 0.75) {
      effortLabel = 'Lebih pelan';
      effortColor = colors.caution;
      indicator = '50%';
    }
  }

  function shiftDate(days) {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    if (next.getTime() > Date.now()) return;
    setSelectedDate(next.getTime());
  }

  function hasActivityOn(date) {
    const key = dayKey(date.getTime());
    return sessions.some((session) => dayKey(new Date(session.date)) === key);
  }

  function openDebug() {
    navigation.navigate('GyroTest');
  }

  function replayOnboarding() {
    navigation.navigate('Onboarding');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Uji sensor" delayLongPress={1500} onLongPress={openDebug}>
            <Text style={[styles.brand, { color: colors.accent }]}>RehabTrack</Text>
          </Pressable>
          <View style={styles.headerButtons}>
            <Pressable accessibilityRole="button" accessibilityLabel="Tutorial" onPress={replayOnboarding} style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.line }]}>
              <Text style={[styles.headerButtonText, { color: colors.text }]}>?</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Ganti tema" onPress={toggleTheme} style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.line }]}>
              <Text style={[styles.headerButtonText, { color: colors.text }]}>{theme === 'dark' ? '☀' : '☾'}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Progres Anda</Text>
        {pendingCount ? <Text style={[styles.syncStatus, { color: colors.caution }]}>{pendingCount} sesi menunggu sinkronisasi</Text> : null}

        {/* Streak banner */}
        <View style={[styles.streakBanner, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <View style={styles.streakLeft}>
            <Text style={styles.streakFire}>🔥</Text>
            <View>
              <Text style={[styles.streakValue, { color: '#E09B2B' }]}>{streak.current}</Text>
              <Text style={[styles.streakLabel, { color: colors.body }]}>Hari beruntun</Text>
            </View>
          </View>
          <View style={styles.streakRight}>
            <View style={styles.streakBestBadge}>
              <Text style={styles.streakBestText}>Terbaik: {streak.best}</Text>
            </View>
            <Text style={[styles.practicedToday, { color: streak.practicedToday ? '#085041' : colors.body }]}>
              {streak.practicedToday ? '✓ Sudah berlatih hari ini' : 'Belum berlatih hari ini'}
            </Text>
          </View>
        </View>

        {/* Today's practice status */}
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <Text style={[styles.eyebrow, { color: colors.body }]}>{isSelectedToday ? "Latihan hari ini" : DAY_NAMES[new Date(selectedDate).getDay()] + ', ' + new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</Text>
          <Text style={[styles.statusTitle, { color: colors.text }]}>{hasPractice ? 'Latihan tercatat' : 'Belum ada latihan'}</Text>
          <Text style={[styles.statusSub, { color: colors.body }]}>{hasPractice ? `${daySessions.length} sesi tercatat hari ini.` : 'Mulai sesi dari tab Latihan.'}</Text>
        </View>

        {/* Weekly calendar */}
        <View style={[styles.weekStrip, { backgroundColor: colors.card, borderColor: colors.line }]}>
          {weekDays.map((d, index) => {
            const isActive = dayKey(d.getTime()) === selectedKey;
            const hasActivity = hasActivityOn(d);
            const isFuture = d.getTime() > Date.now() && dayKey(d.getTime()) !== dayKey(Date.now());
            return (
              <Pressable
                key={index}
                accessibilityRole="button"
                disabled={isFuture}
                onPress={() => setSelectedDate(d.getTime())}
                style={[styles.weekDay, isFuture && { opacity: 0.25 }]}
              >
                <Text style={[styles.weekDayLetter, { color: colors.body }]}>{DAY_LETTERS[index]}</Text>
                <View style={[styles.dayCircle, isActive && { backgroundColor: colors.text }]}>
                  <Text style={[styles.dayNumber, { color: colors.text }, isActive && { color: colors.card }]}>{d.getDate()}</Text>
                </View>
                {hasActivity ? <View style={[styles.activityDot, { backgroundColor: colors.accent }]} /> : null}
              </Pressable>
            );
          })}
        </View>

        {/* See my progress */}
        <Pressable accessibilityRole="button" onPress={() => setShowDetails(!showDetails)} style={[styles.showMore, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <Text style={[styles.showMoreText, { color: colors.text }]}>{showDetails ? 'Sembunyikan detail' : 'Lihat progres saya'}</Text>
          <Text style={[styles.showMoreChevron, { color: colors.body }]}>{showDetails ? '▲' : '▼'}</Text>
        </Pressable>

        {showDetails ? (
          <View>
            {/* Target rings */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Metrik target hari ini</Text>
            <View style={styles.ringsRow}>
              <Ring percentage={romPercent} label="ROM PUNCAK" subLabel={hasExercisePractice ? `${dayBestRom.toFixed(0)}°` : '0'} color={colors.accent} theme={theme} colors={colors} />
              <Ring percentage={smoothnessPercent} label="KELANCARAN" subLabel={hasExercisePractice ? `${smoothnessPercent}%` : '0%'} color={colors.accent} theme={theme} colors={colors} />
            </View>

            {/* Coach insight */}
            <View style={[styles.coachCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
              <View style={[styles.coachDot, { backgroundColor: coachColor }]} />
              <View style={styles.coachTextCol}>
                <Text style={[styles.coachTitle, { color: colors.text }]}>{coachTitle}</Text>
                <Text style={[styles.coachMessage, { color: colors.body }]}>{coachMessage}</Text>
              </View>
            </View>

            {/* Today's effort */}
            <View style={[styles.effortCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
              <Text style={[styles.effortLabel, { color: colors.muted }]}>TINGKAT USAHA HARI INI</Text>
              <Text style={[styles.effortValue, { color: hasExercisePractice ? effortColor : colors.body }]}>{hasExercisePractice ? effortLabel : 'Belum ada data'}</Text>
              {hasExercisePractice ? (
                <View style={styles.slider}>
                  <View style={styles.sliderBar}>
                    <View style={[styles.sliderSegment, { backgroundColor: colors.accent }]} />
                    <View style={[styles.sliderSegment, { backgroundColor: colors.caution }]} />
                    <View style={[styles.sliderSegment, { backgroundColor: colors.danger }]} />
                  </View>
                  <View style={[styles.sliderIndicator, { backgroundColor: effortColor, left: indicator }]} />
                </View>
              ) : null}
            </View>

            {/* All-time stats */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistik keseluruhan</Text>
            <View style={styles.statsGrid}>
              <Stat value={String(sessions.length)} label="Total sesi" colors={colors} />
              <Stat value={String(repTotal)} label="Total repetisi" colors={colors} />
              <Stat value={`${Math.round(bestRom)}°`} label="ROM terbaik" colors={colors} />
            </View>

            {/* Session logs for selected day */}
            {hasPractice ? (
              <View style={styles.logs}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Log sesi hari ini</Text>
                {daySessions.map((session) => {
                  const ex = EXERCISES[session.exercise];
                  return (
                    <View key={session.id} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
                      <Text style={[styles.logName, { color: colors.text }]}>{ex?.name || session.exercise}</Text>
                      <Text style={[styles.logMeta, { color: colors.body }]}>
                        {session.repsCompleted ?? 0} repetisi · ROM {session.peakRom ?? 0}°{Number.isFinite(session.avgSmoothness) ? ` · Kelancaran ${Math.round(session.avgSmoothness * 100)}%` : ''}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ROM trend */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tren ROM</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>{EXERCISE_LIST.map((exerciseItem) => <Pressable key={exerciseItem.key} accessibilityRole="button" onPress={() => setExerciseKey(exerciseItem.key)} style={[styles.selectorItem, { borderColor: colors.line }, exerciseKey === exerciseItem.key && { backgroundColor: colors.accent, borderColor: colors.accent }]}><Text style={[styles.selectorText, { color: colors.body }, exerciseKey === exerciseItem.key && { color: '#FFFFFF', fontWeight: '700' }]}>{exerciseItem.name}</Text></Pressable>)}</ScrollView>
        <ROMChart exerciseKey={exerciseKey} sessions={sessions} />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sesi terakhir</Text>
        <View style={[styles.sessionList, { backgroundColor: colors.card }]}>{sessions.slice(0, 8).map((session) => <SessionCard key={session.id} expanded={expandedId === session.id} onPress={() => setExpandedId(expandedId === session.id ? null : session.id)} session={session} />)}{!sessions.length && <Text style={[styles.empty, { color: colors.body }]}>Belum ada sesi. Yuk mulai latihan pertama Anda.</Text>}</View>

        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          onPress={callTherapist}
          style={({ pressed }) => [styles.callButton, { backgroundColor: '#185FA5' }, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.callIcon}>📞</Text>
          <Text style={styles.callLabel}>Hubungi Terapis</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Ring({ percentage, color, label, subLabel, theme, colors }) {
  const size = 96;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: percentage,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [percentage, animValue]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.ringCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.line} strokeWidth={strokeWidth} fill="transparent" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[styles.ringValue, { color: theme === 'dark' ? '#FFFFFF' : '#2C2C2A' }]}>{subLabel}</Text>
      <Text style={[styles.ringLabel, { color: colors.body }]}>{label}</Text>
    </View>
  );
}

function Stat({ value, label, colors }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.body }]}>{label}</Text>
    </View>
  );
}
