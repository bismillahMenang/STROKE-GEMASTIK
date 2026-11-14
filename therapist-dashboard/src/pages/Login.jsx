import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginTherapist } from '../api/therapistAPI';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await loginTherapist(email, password);
      localStorage.setItem('rehabtrack_therapist_token', result.token);
      navigate('/patients', { replace: true });
    } catch (requestError) {
      console.error('Therapist login failed:', requestError);
      setError(requestError.response?.data?.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      {/* Left branding panel */}
      <aside className="auth-panel-left">
        <div className="auth-logo-badge">
          <span className="auth-logo-initials">RT</span>
        </div>
        <p className="auth-tagline">Dashboard Terapis</p>
        <h1 className="auth-headline">Pantau pemulihan<br />pasien Anda dari mana saja</h1>
        <p className="auth-subline">
          Platform monitoring rehabilitasi stroke berbasis sensor gerak yang terhubung langsung ke pasien Anda.
        </p>
        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-dot" />
            Grafik tren ROM per sesi latihan
          </div>
          <div className="auth-feature">
            <div className="auth-feature-dot" />
            Notifikasi saat pasien melewati batas aman
          </div>
          <div className="auth-feature">
            <div className="auth-feature-dot" />
            Resep latihan yang bisa diperbarui kapan saja
          </div>
          <div className="auth-feature">
            <div className="auth-feature-dot" />
            Catatan mingguan terlihat oleh pasien
          </div>
        </div>
      </aside>

      {/* Right form panel */}
      <section className="auth-panel-right">
        <div className="auth-card">
          <p className="auth-form-title">Selamat datang kembali 👋</p>
          <p className="auth-form-sub">Masuk ke akun terapis Anda untuk melanjutkan.</p>
          <form onSubmit={submit}>
            <label>
              Email
              <input
                aria-label="Email"
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@klinik.com"
                type="email"
                value={email}
              />
            </label>
            <label>
              Kata sandi
              <input
                aria-label="Kata sandi"
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                value={password}
              />
            </label>
            {error ? <p className="error" role="alert">{error}</p> : null}
            <button className="primary-button" disabled={loading} type="submit" style={{ width: '100%', marginTop: 4 }}>
              {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
