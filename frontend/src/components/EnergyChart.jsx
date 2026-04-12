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
    <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl backdrop-blur-md shadow-2xl">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-[11px] font-bold text-white uppercase tracking-tighter">{entry.name}: {entry.value} kWh</span>
        </div>
      ))}
    </div>
  );
};

export default function EnergyChart({ data, isOnline }) {
  return (
    <div className="w-full h-full flex flex-col">
      {!isOnline ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4 border border-dashed border-slate-800 rounded-3xl">
          <WifiOff className="h-12 w-12 opacity-20" />
          <span className="text-[11px] font-bold uppercase tracking-widest opacity-50">Stream Disconnected</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" vertical={false} />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59, 130, 246, 0.1)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="normal"
              name="Baseline"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorNormal)"
              strokeWidth={3}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#0f172a' }}
            />
            <Area
              type="monotone"
              dataKey="anomaly"
              name="FDI Spike"
              stroke="#f43f5e"
              fillOpacity={1}
              fill="url(#colorAnomaly)"
              strokeWidth={3}
              activeDot={{ r: 6, stroke: '#f43f5e', strokeWidth: 2, fill: '#0f172a' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
