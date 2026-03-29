import { Activity, WifiOff } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#1a1f35',
        border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: '0.78rem',
      }}
    >
      <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontWeight: 600 }}>
          {entry.name}: {entry.value != null ? `${entry.value} kWh` : '--'}
        </p>
      ))}
    </div>
  );
};

export default function EnergyChart({ data, isOnline }) {
  return (
    <div className="panel animate-fade-in">
      <div className="panel__header">
        <Activity className="panel__icon" />
        <div>
          <div className="panel__title">Live Energy Consumption</div>
          <div className="panel__subtitle">Real-time readings with anomaly overlay</div>
        </div>
      </div>

      {!isOnline ? (
        <div className="chart-wrapper" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: 'rgba(10, 14, 26, 0.5)',
          borderRadius: '8px',
          border: '1px dashed rgba(148, 163, 184, 0.15)',
        }}>
          <WifiOff size={40} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          <span style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}>
            Energy data unavailable
          </span>
          <span style={{
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            opacity: 0.7,
          }}>
            Connect the backend to view real-time consumption
          </span>
        </div>
      ) : (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAnomaly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="normal"
                name="Normal (kWh)"
                stroke="#06b6d4"
                fill="url(#gradNormal)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#06b6d4', strokeWidth: 2, fill: '#1a1f35' }}
              />
              <Area
                type="monotone"
                dataKey="anomaly"
                name="FDI Anomaly (kWh)"
                stroke="#f43f5e"
                fill="url(#gradAnomaly)"
                strokeWidth={2}
                dot={{ r: 4, stroke: '#f43f5e', strokeWidth: 2, fill: '#1a1f35' }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
