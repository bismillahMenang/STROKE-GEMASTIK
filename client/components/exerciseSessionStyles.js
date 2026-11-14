import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: { flex: 1 },

  // Header bar
  headerBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  headerDot: { width: 8, height: 8, borderRadius: 4 },
  exerciseName: { fontSize: 20, fontWeight: '700', flex: 1 },

  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },

  // Instructions
  instructionsWrap: { flex: 1 },
  instructionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 16,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  instructionCardLabel: {
    color: '#9B9992', fontSize: 11, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: 10,
  },
  helper: { fontSize: 16, lineHeight: 26 },

  // Prescription row
  rxRow: {
    backgroundColor: '#FFFFFF', borderRadius: 16, flexDirection: 'row',
    marginBottom: 14, padding: 16,
    shadowColor: '#1E1E1C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  rxItem: { alignItems: 'center', flex: 1 },
  rxIcon: { fontSize: 22, marginBottom: 6 },
  rxValue: { fontSize: 22, fontWeight: '700' },
  rxLabel: { color: '#9B9992', fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 3, letterSpacing: 0.3 },
  rxDivider: { width: 1, backgroundColor: '#E0DED5', marginVertical: 4 },

  safetyNote: {
    backgroundColor: '#FFF8E1', borderRadius: 10, padding: 12, marginBottom: 20,
  },
  safetyNoteText: { color: '#7A4E0D', fontSize: 13, fontWeight: '500', lineHeight: 19 },

  target: { fontSize: 17, fontWeight: '600', marginTop: 18 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },

  // Countdown
  countdownRing: {
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 8, alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  countdown: { fontSize: 72, fontWeight: '800', lineHeight: 80 },
  countdownSub: { fontSize: 14, fontWeight: '600', marginTop: -4 },
  cancelBtn: { marginTop: 24 },
  cancel: { fontSize: 15, fontWeight: '600', padding: 12 },

  // Gauge
  gauge: {
    alignItems: 'center', borderRadius: 140,
    borderWidth: 20, height: 250, justifyContent: 'center', width: 250,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8,
  },
  angle: { fontSize: 52, fontWeight: '800', lineHeight: 58 },
  angleDeg: { color: '#9B9992', fontSize: 20, fontWeight: '700', position: 'absolute', top: 72, right: 62 },
  gaugeLabel: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  progressTrack: {
    width: 100, height: 4, backgroundColor: '#E0DED5',
    borderRadius: 2, marginTop: 12, overflow: 'hidden',
  },
  progressFill: { height: 4, borderRadius: 2 },

  // Rep counter
  repRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 20 },
  repNum: { fontSize: 40, fontWeight: '800' },
  repSlash: { fontSize: 24, fontWeight: '600' },
  repLabel: { fontSize: 18, fontWeight: '500' },

  // Ceiling banner
  ceilingBanner: {
    backgroundColor: '#FDECEA', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10, marginBottom: 16,
  },
  ceilingBannerText: { color: '#A32D2D', fontSize: 14, fontWeight: '700', textAlign: 'center' },

  // Primary button
  primaryButton: {
    alignItems: 'center', borderRadius: 100,
    justifyContent: 'center', minHeight: 56, width: '100%', marginTop: 24,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 5,
  },
  primaryLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

  // Actions
  actions: { marginTop: 'auto' },
  secondaryButton: { alignItems: 'center', minHeight: 48, justifyContent: 'center', marginTop: 10 },
  secondaryLabel: { fontSize: 15, fontWeight: '700' },

  // Feedback
  savedBanner: {
    backgroundColor: '#E5F3EC', borderRadius: 10, padding: 12, marginTop: 14,
    alignItems: 'center',
  },
  savedText: { color: '#085041', fontSize: 15, fontWeight: '700' },
  error: { fontSize: 14, lineHeight: 20, marginTop: 14, fontWeight: '500' },
});
