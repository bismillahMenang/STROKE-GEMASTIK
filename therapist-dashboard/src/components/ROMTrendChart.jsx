import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ROMTrendChart({ sessions, exercise }) {
  const data = sessions.filter((session) => session.exercise === exercise).slice(0, 8).reverse().map((session) => ({ date: new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), rom: session.peakRom, target: exercise === 'forearm_supination' ? 80 : exercise === 'shoulder_abduction' ? 90 : 150 }));
  if (!data.length) return <div className="chart-empty">Belum ada data ROM untuk latihan ini.</div>;
  return <div className="chart-wrap"><ResponsiveContainer height={280} width="100%"><LineChart data={data} margin={{ top: 12, right: 18, bottom: 4, left: 0 }}><CartesianGrid stroke="#E3E1D8" strokeDasharray="4 4" /><XAxis dataKey="date" tick={{ fill: '#888780', fontSize: 12 }} /><YAxis tick={{ fill: '#888780', fontSize: 12 }} unit="°" /><Tooltip /><ReferenceLine y={data[0].target} stroke="#D85A30" strokeDasharray="5 5" /><Line dataKey="rom" dot={{ fill: '#185FA5', r: 4 }} name="ROM puncak" stroke="#185FA5" strokeWidth={3} type="monotone" /></LineChart></ResponsiveContainer></div>;
}
