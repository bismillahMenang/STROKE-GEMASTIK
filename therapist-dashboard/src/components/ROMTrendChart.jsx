import {
  Area, AreaChart, CartesianGrid, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const DEFAULT_TARGETS = {
  forearm_supination: 80,
  shoulder_abduction: 90,
  elbow_flexion: 150,
  wrist_flexion: 60,
  finger_extension: 30,
  resistance_band_row: 45,
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E0DED5', borderRadius: 10,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: '10px 14px',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#9B9992', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ margin: '2px 0', fontSize: 14, fontWeight: 700, color: entry.color }}>
          {entry.name}: {entry.value}°
        </p>
      ))}
    </div>
  );
}

export default function ROMTrendChart({ sessions, exercise, targetRom }) {
  const target = Number.isFinite(targetRom) && targetRom > 0
    ? targetRom
    : (DEFAULT_TARGETS[exercise] || 0);

  const data = sessions
    .filter((session) => session.exercise === exercise)
    .slice(0, 8)
    .reverse()
    .map((session) => ({
      date: new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      rom: session.peakRom,
      target,
    }));

  if (!data.length) {
    return (
      <div className="chart-empty">
        <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
        Belum ada data ROM untuk latihan ini.
      </div>
    );
  }

  return (
    <div className="chart-wrap">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="romGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F9E75" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0F9E75" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E0DED5" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#9B9992', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9B9992', fontSize: 12 }} unit="°" axisLine={false} tickLine={false} width={36} />
          <Tooltip content={<CustomTooltip />} />
          {target > 0 ? (
            <ReferenceLine y={target} stroke="#D85A30" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: `Target ${target}°`, position: 'right', fontSize: 11, fill: '#D85A30', fontWeight: 700 }} />
          ) : null}
          <Area
            dataKey="rom"
            dot={{ fill: '#0F9E75', r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
            activeDot={{ r: 7, fill: '#0F9E75', stroke: '#FFFFFF', strokeWidth: 2 }}
            fill="url(#romGrad)"
            name="ROM puncak"
            stroke="#0F9E75"
            strokeWidth={2.5}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
