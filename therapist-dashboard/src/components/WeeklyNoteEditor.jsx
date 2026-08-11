import { useState } from 'react';
import { addWeeklyNote } from '../api/therapistAPI';

export default function WeeklyNoteEditor({ patientId, notes, onSaved }) {
  const [note, setNote] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [weekNumber, setWeekNumber] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!note.trim()) return;
    setSaving(true); setError('');
    try { const saved = await addWeeklyNote(patientId, weekNumber, { note, templateKey: templateKey || undefined }); onSaved(saved); setNote(''); setTemplateKey(''); } catch (requestError) { console.error('Failed to save therapist note:', requestError); setError('Catatan belum tersimpan.'); } finally { setSaving(false); }
  }

  return <section className="notes-section"><div className="section-heading"><div><h2>Catatan mingguan</h2><p className="muted">Catatan ini terlihat oleh pasien.</p></div></div><form className="note-form" onSubmit={submit}><label>Minggu<select aria-label="Minggu" onChange={(event) => setWeekNumber(Number(event.target.value))} value={weekNumber}>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label><label>Template<select aria-label="Template catatan" onChange={(event) => setTemplateKey(event.target.value)} value={templateKey}><option value="">Tanpa template</option><option value="continue">Lanjutkan latihan</option><option value="reduce_target">Kurangi target sementara</option><option value="follow_up">Perlu tindak lanjut</option></select></label><label className="note-input">Catatan<textarea aria-label="Catatan terapis" onChange={(event) => setNote(event.target.value)} placeholder="Tulis arahan atau catatan evaluasi..." value={note} /></label><button className="primary-button compact" disabled={saving} type="submit">{saving ? 'Menyimpan...' : 'Tambah catatan'}</button></form>{error ? <p className="error">{error}</p> : null}<div className="notes-list">{notes.map((item) => <article className="note-item" key={item._id}><div><strong>Minggu {item.weekNumber}</strong><span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span></div><p>{item.note}</p></article>)}</div></section>;
}
