import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  brand: { fontSize: 19, fontWeight: '800', letterSpacing: 0.5 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  headerButton: {
    alignItems: 'center', borderRadius: 20, borderWidth: 1.5,
    height: 40, justifyContent: 'center', width: 40,
  },
  headerButtonText: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800' },
  syncStatus: { fontSize: 13, marginTop: 6, fontWeight: '500' },

  // Streak banner
  streakBanner: {
    alignItems: 'center', borderRadius: 18, borderWidth: 1,
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, padding: 18,
    shadowColor: '#E09B2B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 3,
  },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakFire: { fontSize: 32 },
  streakValue: { fontSize: 38, fontWeight: '900' },
  streakLabel: { fontSize: 13, marginTop: 1, fontWeight: '500' },
  streakRight: { alignItems: 'flex-end', gap: 6 },
  streakBestBadge: {
    backgroundColor: '#F2F1ED', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  streakBestText: { color: '#5C5B57', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  practicedToday: { fontSize: 12, fontWeight: '600' },

  statusCard: {
    borderRadius: 18, borderWidth: 1, marginTop: 14, padding: 18,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  statusTitle: { fontSize: 19, fontWeight: '800', marginTop: 6 },
  statusSub: { fontSize: 13, lineHeight: 19, marginTop: 4 },

  weekStrip: {
    borderRadius: 18, borderWidth: 1, flexDirection: 'row',
    justifyContent: 'space-between', marginTop: 14, padding: 14,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  weekDay: { alignItems: 'center', flex: 1 },
  weekDayLetter: { fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  dayCircle: { alignItems: 'center', borderRadius: 18, height: 34, justifyContent: 'center', width: 34 },
  dayNumber: { fontSize: 13, fontWeight: '800' },
  activityDot: { borderRadius: 3, height: 6, marginTop: 5, width: 6 },

  showMore: {
    alignItems: 'center', borderRadius: 14, borderWidth: 1,
    flexDirection: 'row', justifyContent: 'center', marginTop: 14, minHeight: 48,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  showMoreText: { fontSize: 14, fontWeight: '700' },
  showMoreChevron: { fontSize: 10, marginLeft: 8 },

  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, marginTop: 24, letterSpacing: 0.2 },
  ringsRow: { flexDirection: 'row', gap: 12 },
  ringCard: {
    alignItems: 'center', borderRadius: 18, borderWidth: 1, flex: 1, padding: 14,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  ringValue: { fontSize: 20, fontWeight: '900', marginTop: 8 },
  ringLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginTop: 4, textTransform: 'uppercase' },

  coachCard: {
    alignItems: 'center', borderRadius: 16, borderWidth: 1,
    flexDirection: 'row', marginTop: 14, padding: 16,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  coachDot: { borderRadius: 5, height: 10, marginRight: 14, width: 10 },
  coachTextCol: { flex: 1 },
  coachTitle: { fontSize: 16, fontWeight: '800' },
  coachMessage: { fontSize: 13, lineHeight: 20, marginTop: 4 },

  effortCard: {
    borderRadius: 16, borderWidth: 1, marginTop: 14, padding: 16,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  effortLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  effortValue: { fontSize: 20, fontWeight: '900', marginTop: 6 },
  slider: { height: 16, justifyContent: 'center', marginTop: 14, position: 'relative' },
  sliderBar: { borderRadius: 4, flexDirection: 'row', height: 6, overflow: 'hidden', width: '100%' },
  sliderSegment: { flex: 1 },
  sliderIndicator: { borderColor: '#FFFFFF', borderRadius: 6, borderWidth: 2.5, height: 14, position: 'absolute', width: 14 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    borderRadius: 16, borderWidth: 1, flex: 1, minWidth: '45%', padding: 16,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginTop: 4, textTransform: 'uppercase' },

  logs: { marginTop: 4 },
  logCard: {
    borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 14,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  logName: { fontSize: 14, fontWeight: '800' },
  logMeta: { fontSize: 13, lineHeight: 19, marginTop: 4 },

  selector: { marginTop: 12 },
  selectorItem: {
    borderRadius: 100, borderWidth: 1.5, justifyContent: 'center',
    marginRight: 8, minHeight: 40, paddingHorizontal: 16,
  },
  selectorText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  sessionList: {
    borderRadius: 16, marginTop: 12, paddingHorizontal: 16,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  empty: { fontSize: 15, lineHeight: 23, paddingVertical: 24, color: '#9B9992', textAlign: 'center' },
  error: { fontSize: 14, lineHeight: 20, marginTop: 12, fontWeight: '500' },

  // Call button
  callButton: {
    alignItems: 'center', borderRadius: 100, flexDirection: 'row',
    justifyContent: 'center', minHeight: 56, marginTop: 28, gap: 8,
    shadowColor: '#185FA5', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 6,
  },
  callIcon: { fontSize: 20 },
  callLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
