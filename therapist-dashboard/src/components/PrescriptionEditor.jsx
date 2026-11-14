import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUnauthorized, setPrescription } from '../api/therapistAPI';

const DEFAULTS = {
  forearm_supination: { targetRom: 80, romCeiling: 90, targetReps: 10 },
  shoulder_abduction: { targetRom: 90, romCeiling: 100, targetReps: 10 },
  elbow_flexion: { targetRom: 150, romCeiling: 160, targetReps: 10 },
  wrist_flexion: { targetRom: 60, romCeiling: 75, targetReps: 10 },
  finger_extension: { targetRom: 30, romCeiling: 40, targetReps: 10 },
  resistance_band_row: { targetRom: 45, romCeiling: 60, targetReps: 10 },
};

export default function PrescriptionEditor({
  patientId,
  exercise,
  exerciseLabel,
  prescription,
  onSaved,
}) {
  const navigate = useNavigate();
  const defaults = DEFAULTS[exercise] || { targetRom: 60, romCeiling: 75, targetReps: 10 };
  const [form, setForm] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm({
      targetRom: prescription?.targetRom ?? defaults.targetRom,
      romCeiling: prescription?.romCeiling ?? defaults.romCeiling,
      targetReps: prescription?.targetReps ?? defaults.targetReps,
    });
    setError('');
    setMessage('');
  }, [exercise, prescription, defaults.targetRom, defaults.romCeiling, defaults.targetReps]);

  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage('');
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const targetRom = Number(form.targetRom);
    const romCeiling = Number(form.romCeiling);
    const targetReps = Number(form.targetReps);

    if (![targetRom, romCeiling, targetReps].every((value) => Number.isFinite(value) && value > 0)) {
      setError('Semua nilai harus berupa angka positif.');
      return;
    }

    if (romCeiling < targetRom) {
      setError('Batas aman harus lebih besar atau sama dengan target ROM.');
      return;
    }

    setSaving(true);
    try {
      const saved = await setPrescription(patientId, {
        exercise,
        targetRom,
        romCeiling,
        targetReps,
      });
      onSaved(saved);
      setMessage('Resep tersimpan.');
    } catch (requestError) {
      console.error('Failed to save prescription:', requestError);
      if (isUnauthorized(requestError)) {
        localStorage.removeItem('rehabtrack_therapist_token');
        navigate('/login');
        return;
      }
      setError(requestError.response?.data?.message || 'Resep belum tersimpan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="section-label">Rencana Latihan</p>
          <h2>Resep {exerciseLabel}</h2>
          <p className="muted">
            Target ini dipakai aplikasi pasien sebagai target ROM, batas aman, dan target repetisi.
          </p>
        </div>
        {!prescription ? (
          <span className="count-chip">Belum ada resep</span>
        ) : null}
      </div>

      <form className="note-form" onSubmit={submit}>
        <label>
          Target ROM
          <input
            aria-label="Target ROM"
            min="1"
            onChange={(event) => change('targetRom', event.target.value)}
            step="1"
            type="number"
            value={form.targetRom}
          />
        </label>

        <label>
          Batas aman
          <input
            aria-label="Batas aman ROM"
            min="1"
            onChange={(event) => change('romCeiling', event.target.value)}
            step="1"
            type="number"
            value={form.romCeiling}
          />
        </label>

        <label>
          Target reps
          <input
            aria-label="Target repetisi"
            min="1"
            onChange={(event) => change('targetReps', event.target.value)}
            step="1"
            type="number"
            value={form.targetReps}
          />
        </label>

        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="primary-button compact" disabled={saving} type="submit">
            {saving ? '⏳ Menyimpan...' : 'Simpan Resep'}
          </button>
          {error ? <p className="error" role="alert" style={{ margin: 0 }}>{error}</p> : null}
          {message ? <p className="muted" role="status" style={{ margin: 0 }}>{message}</p> : null}
        </div>
      </form>
    </section>
  );
}
