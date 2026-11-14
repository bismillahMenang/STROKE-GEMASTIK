import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ROMTrendChart from '../components/ROMTrendChart';
import SessionLog from '../components/SessionLog';
import WeeklyNoteEditor from '../components/WeeklyNoteEditor';
import PrescriptionEditor from '../components/PrescriptionEditor';
import { fetchPatientDetail, isUnauthorized, updateSessionReview } from '../api/therapistAPI';

const EXERCISE_LABELS = {
  forearm_supination: 'Supinasi Lengan',
  shoulder_abduction: 'Abduksi Bahu',
  elbow_flexion: 'Fleksi Siku',
  wrist_flexion: 'Fleksi Pergelangan',
  finger_extension: 'Ekstensi Jari',
  resistance_band_row: 'Resistance Band Row',
};
const exercises = Object.keys(EXERCISE_LABELS);
const THERAPIST_CALL_URL = import.meta.env.VITE_THERAPIST_CALL_URL || '';

export default function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [exercise, setExercise] = useState(exercises[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientDetail(patientId).then(setDetail).catch((requestError) => {
      console.error('Failed to load patient detail:', requestError);
      if (isUnauthorized(requestError)) {
        localStorage.removeItem('rehabtrack_therapist_token');
        navigate('/login');
        return;
      }
      setError('Detail pasien belum dapat dimuat.');
    });
  }, [navigate, patientId]);

  function addNote(note) {
    setDetail((current) => ({ ...current, notes: [note, ...current.notes] }));
  }

  function savePrescription(saved) {
    setDetail((current) => ({
      ...current,
      prescriptions: [
        ...(current.prescriptions || []).filter((rx) => rx.exercise !== saved.exercise),
        saved,
      ],
    }));
  }

  async function reviewSession(sessionId, reviewStatus) {
    try {
      const updated = await updateSessionReview(patientId, sessionId, reviewStatus);
      setDetail((current) => ({
        ...current,
        sessions: current.sessions.map((session) => session.id === updated.id ? updated : session),
      }));
    } catch (requestError) {
      console.error('Failed to update session review:', requestError);
      setError('Status review belum tersimpan.');
    }
  }

  function startCall() {
    if (!THERAPIST_CALL_URL) {
      window.alert('Link video call belum dikonfigurasi.');
      return;
    }
    window.open(THERAPIST_CALL_URL, '_blank', 'noopener,noreferrer');
  }

  if (error) {
    return (
      <main className="dashboard-shell">
        <div className="content-card" style={{ borderLeft: '3px solid var(--red)', background: 'var(--red-bg)' }}>
          <p className="error">⚠️ {error}</p>
        </div>
      </main>
    );
  }

  if (!detail) {
    return (
      <main className="dashboard-shell">
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <p className="muted" style={{ fontSize: 16 }}>⏳ Memuat detail pasien...</p>
        </div>
      </main>
    );
  }

  const totalSessions = detail.totalSessions ?? detail.sessions.length;
  const totalReps = detail.totalReps ?? 0;
  const lastROM = detail.sessions[0]?.peakRom ?? 0;
  const activePrescription = (detail.prescriptions || [])
    .find((rx) => rx.exercise === exercise && rx.isActive !== false);

  return (
    <main className="dashboard-shell">
      {/* Header */}
      <header className="detail-header">
        <div>
          <Link className="breadcrumb" to="/patients">← Kembali ke daftar pasien</Link>
          <h1>{detail.patient.name}</h1>
          <p className="muted">{detail.patient.diagnosis || 'Program rehabilitasi rumah'}</p>
          {detail.patient.phone ? (
            <a
              className="contact-link"
              href={`https://wa.me/${detail.patient.phone}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              📱 Hubungi via WhatsApp
            </a>
          ) : null}
        </div>
        <button className="primary-button call-button" onClick={startCall} type="button">
          🎥 Mulai video call
        </button>
      </header>

      {/* Quick stats row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="content-card" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
          <p className="section-label">Total Sesi</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--teal)', margin: 0 }}>{totalSessions}</p>
        </div>
        <div className="content-card" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
          <p className="section-label">Total Repetisi</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--teal)', margin: 0 }}>{totalReps}</p>
        </div>
        <div className="content-card" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
          <p className="section-label">ROM Terakhir</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--blue)', margin: 0 }}>{lastROM}°</p>
        </div>
        <div className="content-card" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
          <p className="section-label">Catatan Terapis</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', margin: 0 }}>{detail.notes.length}</p>
        </div>
      </div>

      {/* ROM Chart */}
      <section className="content-card">
        <div className="section-heading">
          <div>
            <p className="section-label">Grafik Perkembangan</p>
            <h2>Tren ROM 8 sesi terakhir</h2>
            <p className="muted">Garis oranye menunjukkan target ROM dari resep terapis, atau target default jika belum ada resep.</p>
          </div>
          <select
            aria-label="Pilih latihan"
            onChange={(event) => setExercise(event.target.value)}
            style={{ minWidth: 180 }}
            value={exercise}
          >
            {exercises.map((item) => (
              <option key={item} value={item}>{EXERCISE_LABELS[item] || item}</option>
            ))}
          </select>
        </div>
        <ROMTrendChart exercise={exercise} sessions={detail.sessions} targetRom={activePrescription?.targetRom} />
      </section>

      {/* Prescription editor */}
      <section className="content-card">
        <PrescriptionEditor
          exercise={exercise}
          exerciseLabel={EXERCISE_LABELS[exercise] || exercise}
          onSaved={savePrescription}
          patientId={patientId}
          prescription={activePrescription}
        />
      </section>

      {/* Session log */}
      <section className="content-card">
        <p className="section-label">Riwayat Latihan</p>
        <h2>Log Sesi</h2>
        <SessionLog onReview={reviewSession} sessions={detail.sessions} />
      </section>

      {/* Weekly notes */}
      <section className="content-card">
        <WeeklyNoteEditor notes={detail.notes} onSaved={addNote} patientId={patientId} />
      </section>
    </main>
  );
}
