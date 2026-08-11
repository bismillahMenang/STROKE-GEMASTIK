import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPatients, isUnauthorized } from '../api/therapistAPI';

const trendClass = { '↑': 'trend-up', '→': 'trend-neutral', '↓': 'trend-down' };

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients().then(setPatients).catch((requestError) => {
      console.error('Failed to load patients:', requestError);
      if (isUnauthorized(requestError)) { localStorage.removeItem('pulihtrack_therapist_token'); navigate('/login'); return; }
      setError('Daftar pasien belum dapat dimuat.');
    });
  }, [navigate]);

  function logout() { localStorage.removeItem('pulihtrack_therapist_token'); navigate('/login', { replace: true }); }

  return <main className="dashboard-shell"><header className="topbar"><div><p className="brand-mark">PulihTrack</p><h1>Pasien Saya</h1></div><button className="text-button" onClick={logout} type="button">Keluar</button></header><section className="content-card"><div className="section-heading"><div><h2>Perlu perhatian minggu ini</h2><p className="muted">Tinjau tren ROM dan sesi terakhir pasien Anda.</p></div><span className="count-chip">{patients.length} pasien</span></div>{error ? <p className="error" role="alert">{error}</p> : null}{!error && !patients.length ? <div className="empty-state"><h2>Belum ada pasien</h2><p className="muted">Pasien yang ditugaskan akan muncul di sini.</p></div> : <div className="patient-table"><div className="table-head"><span>Nama</span><span>Sesi terakhir</span><span>Tren</span><span>Status</span></div>{patients.map((patient) => <Link className="patient-row" key={patient._id} to={`/patients/${patient._id}`}><strong>{patient.name}</strong><span>{patient.lastSessionDate ? new Date(patient.lastSessionDate).toLocaleDateString('id-ID') : 'Belum ada sesi'}</span><span className={trendClass[patient.trend] || 'trend-neutral'}>{patient.trend}</span><span className={patient.trend === '↓' ? 'status status-risk' : 'status status-track'}>{patient.trend === '↓' ? 'Perlu perhatian' : 'On-track'}</span></Link>)}</div>}</section></main>;
}
