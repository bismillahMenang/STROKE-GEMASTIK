import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPatients, isUnauthorized } from '../api/therapistAPI';

const TREND_CLASS = { '↑': 'trend-up', '→': 'trend-neutral', '↓': 'trend-down' };
const TREND_LABEL = { '↑': '↑ Meningkat', '→': '→ Stabil', '↓': '↓ Menurun' };

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients().then(setPatients).catch((requestError) => {
      console.error('Failed to load patients:', requestError);
      if (isUnauthorized(requestError)) {
        localStorage.removeItem('rehabtrack_therapist_token');
        navigate('/login');
        return;
      }
      setError('Daftar pasien belum dapat dimuat.');
    });
  }, [navigate]);

  function logout() {
    localStorage.removeItem('rehabtrack_therapist_token');
    navigate('/login', { replace: true });
  }

  const atRiskCount = patients.filter((p) => p.trend === '↓').length;

  return (
    <main className="dashboard-shell">
      {/* Top bar */}
      <header className="topbar">
        <div>
          <div className="brand-mark">
            <span className="brand-mark-badge">RT</span>
            RehabTrack
          </div>
          <h1>Pasien Saya</h1>
          <p className="muted">Pantau perkembangan latihan pasien Anda minggu ini.</p>
        </div>
        <button className="text-button" onClick={logout} type="button">Keluar</button>
      </header>

      {/* Alert strip — only when there are at-risk patients */}
      {atRiskCount > 0 ? (
        <div className="content-card" style={{ borderLeft: '3px solid var(--red)', background: 'var(--red-bg)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 14 }}>
              {atRiskCount} pasien memerlukan perhatian minggu ini
            </span>
          </div>
        </div>
      ) : null}

      <section className="content-card">
        <div className="section-heading">
          <div>
            <p className="section-label">Daftar Pasien</p>
            <h2>Tren ROM & Status</h2>
            <p className="muted">Tinjau tren ROM dan sesi terakhir pasien Anda.</p>
          </div>
          <span className="count-chip">{patients.length} pasien</span>
        </div>

        {error ? <p className="error" role="alert">{error}</p> : null}

        {!error && !patients.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏥</div>
            <h2>Belum ada pasien</h2>
            <p className="muted">Pasien yang ditugaskan akan muncul di sini setelah mendaftar.</p>
          </div>
        ) : (
          <div className="patient-table">
            <div className="table-head">
              <span>Nama Pasien</span>
              <span>Sesi Terakhir</span>
              <span>Tren ROM</span>
              <span>Status</span>
            </div>
            {patients.map((patient) => (
              <Link className="patient-row" key={patient.id} to={`/patients/${patient.id}`}>
                <strong style={{ fontSize: 15 }}>{patient.name}</strong>
                <span style={{ color: 'var(--text-2)', fontSize: 13 }}>
                  {patient.lastSessionDate
                    ? new Date(patient.lastSessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                    : '—'}
                </span>
                <span className={TREND_CLASS[patient.trend] || 'trend-neutral'} style={{ fontSize: 13 }}>
                  {TREND_LABEL[patient.trend] || patient.trend}
                </span>
                <span className={`status ${patient.trend === '↓' ? 'status-risk' : patient.trend === '↑' ? 'status-track' : 'status-neutral'}`}>
                  {patient.trend === '↓' ? 'Perlu perhatian' : patient.trend === '↑' ? 'On-track' : 'Stabil'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
