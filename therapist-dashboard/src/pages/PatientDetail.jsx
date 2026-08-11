import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ROMTrendChart from '../components/ROMTrendChart';
import SessionLog from '../components/SessionLog';
import WeeklyNoteEditor from '../components/WeeklyNoteEditor';
import AssessmentSummary from '../components/AssessmentSummary';
import { fetchPatientDetail, isUnauthorized, updateSessionReview } from '../api/therapistAPI';

const exercises = ['forearm_supination', 'shoulder_abduction', 'elbow_flexion', 'wrist_flexion', 'finger_extension', 'resistance_band_row'];

export default function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [exercise, setExercise] = useState(exercises[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientDetail(patientId).then(setDetail).catch((requestError) => {
      console.error('Failed to load patient detail:', requestError);
      if (isUnauthorized(requestError)) { localStorage.removeItem('pulihtrack_therapist_token'); navigate('/login'); return; }
      setError('Detail pasien belum dapat dimuat.');
    });
  }, [navigate, patientId]);

  function addNote(note) { setDetail((current) => ({ ...current, notes: [note, ...current.notes] })); }
  async function reviewSession(sessionId, reviewStatus) { try { const updated = await updateSessionReview(patientId, sessionId, reviewStatus); setDetail((current) => ({ ...current, sessions: current.sessions.map((session) => session._id === updated._id ? updated : session) })); } catch (requestError) { console.error('Failed to update session review:', requestError); setError('Status review belum tersimpan.'); } }
  function startCall() { window.open('https://meet.google.com/your-pulihtrack-room', '_blank', 'noopener,noreferrer'); }

  if (error) return <main className="dashboard-shell"><p className="error">{error}</p></main>;
  if (!detail) return <main className="dashboard-shell"><p className="muted">Memuat detail pasien...</p></main>;

  return <main className="dashboard-shell"><header className="detail-header"><div><Link className="breadcrumb" to="/patients">← Kembali ke pasien</Link><h1>{detail.patient.name}</h1><p className="muted">{detail.patient.diagnosis || 'Program rehabilitasi rumah'}</p>{detail.patient.phone ? <a className="contact-link" href={`https://wa.me/${detail.patient.phone}`}>Hubungi pasien</a> : null}</div><button className="primary-button call-button" onClick={startCall} type="button">Mulai video call</button></header><section className="content-card"><AssessmentSummary assessments={detail.assessments} /></section><section className="content-card"><div className="section-heading"><div><h2>Tren ROM 8 minggu</h2><p className="muted">Garis oranye menunjukkan target latihan.</p></div><select aria-label="Pilih latihan" onChange={(event) => setExercise(event.target.value)} value={exercise}>{exercises.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><ROMTrendChart exercise={exercise} sessions={detail.sessions} /></section><section className="content-card"><h2>Log sesi</h2><SessionLog onReview={reviewSession} sessions={detail.sessions} /></section><section className="content-card"><WeeklyNoteEditor notes={detail.notes} onSaved={addNote} patientId={patientId} /></section></main>;
}
