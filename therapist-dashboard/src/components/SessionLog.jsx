const EXERCISE_LABELS = {
  forearm_supination: 'Supinasi Lengan',
  shoulder_abduction: 'Abduksi Bahu',
  elbow_flexion: 'Fleksi Siku',
  wrist_flexion: 'Fleksi Pergelangan',
  finger_extension: 'Ekstensi Jari',
  resistance_band_row: 'Resistance Band',
};

const PAIN_LABELS = {
  none: { label: 'Tanpa nyeri', color: 'var(--green)', bg: 'var(--green-bg)' },
  mild: { label: 'Nyeri ringan', color: 'var(--amber)', bg: 'var(--amber-bg)' },
  stopped: { label: 'Berhenti', color: 'var(--red)', bg: 'var(--red-bg)' },
};

export default function SessionLog({ sessions, onReview }) {
  return (
    <div className="session-table">
      <div className="table-head">
        <span>Tanggal</span>
        <span>Latihan</span>
        <span>ROM Puncak</span>
        <span>Repetisi</span>
        <span>Catatan Pasien</span>
        <span>Review</span>
      </div>
      {sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>Belum ada sesi tercatat.</p>
        </div>
      ) : null}
      {sessions.map((session) => {
        const pain = PAIN_LABELS[session.pain];
        return (
          <div className="session-row" key={session.id}>
            <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>
              {new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {EXERCISE_LABELS[session.exercise] || session.exercise}
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--teal)' }}>
              {session.peakRom}°
            </span>
            <span style={{ fontSize: 13 }}>
              {session.repsCompleted}/10
            </span>
            <span>
              {pain ? (
                <span style={{ background: pain.bg, color: pain.color, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 8px' }}>
                  {pain.label}
                </span>
              ) : null}
              {session.notes ? (
                <span style={{ color: 'var(--text-2)', fontSize: 12, display: 'block', marginTop: 2 }} title={session.notes}>
                  {session.notes.slice(0, 40)}{session.notes.length > 40 ? '…' : ''}
                </span>
              ) : (!pain ? <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span> : null)}
            </span>
            <span className="review-actions">
              <button
                className={session.reviewStatus === 'good' ? 'review-active good' : ''}
                onClick={() => onReview(session.id, 'good')}
                title="Tandai baik"
                type="button"
              >✓</button>
              <button
                className={session.reviewStatus === 'attention' ? 'review-active attention' : ''}
                onClick={() => onReview(session.id, 'attention')}
                title="Perlu perhatian"
                type="button"
              >!</button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
