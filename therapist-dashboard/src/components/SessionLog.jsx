export default function SessionLog({ sessions }) {
  return <div className="session-table"><div className="table-head"><span>Tanggal</span><span>Latihan</span><span>ROM puncak</span><span>Repetisi</span><span>Catatan pasien</span></div>{sessions.map((session) => <div className="session-row" key={session._id}><span>{new Date(session.date).toLocaleDateString('id-ID')}</span><span>{session.exercise}</span><span>{session.peakRom}°</span><span>{session.repsCompleted}/10</span><span>{session.notes || '—'}</span></div>)}</div>;
}
