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
      localStorage.setItem('pulihtrack_therapist_token', result.token);
      navigate('/patients', { replace: true });
    } catch (requestError) {
      console.error('Therapist login failed:', requestError);
      setError(requestError.response?.data?.message || 'Email atau password salah.');
    } finally { setLoading(false); }
  }

  return <main className="auth-shell"><section className="auth-card"><p className="brand-mark">PulihTrack</p><h1>Masuk sebagai terapis</h1><p className="muted">Tinjau progres latihan pasien Anda setiap minggu.</p><form onSubmit={submit}><label>Email<input aria-label="Email" autoComplete="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} /></label><label>Kata sandi<input aria-label="Kata sandi" autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} /></label>{error ? <p className="error" role="alert">{error}</p> : null}<button className="primary-button" disabled={loading} type="submit">{loading ? 'Memproses...' : 'Masuk'}</button></form></section></main>;
}
