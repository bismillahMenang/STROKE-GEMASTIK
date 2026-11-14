import { useState } from 'react';
import { addWeeklyNote } from '../api/therapistAPI';

const TEMPLATES = [
  { value: '', label: 'Tanpa template' },
  { value: 'continue', label: 'Lanjutkan latihan' },
  { value: 'reduce_target', label: 'Kurangi target sementara' },
  { value: 'follow_up', label: 'Perlu tindak lanjut' },
];

export default function WeeklyNoteEditor({ patientId, notes, onSaved }) {
  const [note, setNote] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [weekNumber, setWeekNumber] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    setError('');
    try {
      const saved = await addWeeklyNote(patientId, weekNumber, { note, templateKey: templateKey || undefined });
      onSaved(saved);
      setNote('');
      setTemplateKey('');
    } catch (requestError) {
      console.error('Failed to save therapist note:', requestError);
      setError('Catatan belum tersimpan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="notes-section">
      <div className="section-heading">
        <div>
          <p className="section-label">Catatan Terapis</p>
          <h2>Catatan Mingguan</h2>
          <p className="muted">Catatan ini terlihat oleh pasien melalui aplikasi mobile.</p>
        </div>
      </div>

      <form className="note-form" onSubmit={submit}>
        <label>
          Minggu
          <select aria-label="Minggu" onChange={(event) => setWeekNumber(Number(event.target.value))} value={weekNumber}>
            {Array.from({ length: 8 }, (_, index) => (
              <option key={index + 1} value={index + 1}>Minggu {index + 1}</option>
            ))}
          </select>
        </label>

        <label>
          Template
          <select aria-label="Template catatan" onChange={(event) => setTemplateKey(event.target.value)} value={templateKey}>
            {TEMPLATES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <label className="note-input" style={{ gridColumn: '1 / -1' }}>
          Isi Catatan
          <textarea
            aria-label="Catatan terapis"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Tulis arahan atau catatan evaluasi untuk pasien..."
            value={note}
          />
        </label>

        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="primary-button compact" disabled={saving || !note.trim()} type="submit">
            {saving ? '⏳ Menyimpan...' : '+ Tambah Catatan'}
          </button>
          {error ? <p className="error" role="alert" style={{ margin: 0 }}>{error}</p> : null}
        </div>
      </form>

      {/* Notes list */}
      {notes.length > 0 ? (
        <div className="notes-list">
          {notes.map((item) => (
            <article className="note-item" key={item.id}>
              <div>
                <strong>Minggu {item.weekNumber}</strong>
                <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      ) : (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          Belum ada catatan. Tambahkan catatan pertama untuk pasien ini.
        </div>
      )}
    </section>
  );
}
