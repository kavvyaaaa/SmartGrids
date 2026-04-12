import { BrainCircuit, Cpu, Network } from 'lucide-react';

export default function MLStatus({ mlStatus }) {
  const entries = Object.entries(mlStatus || {});

  if (entries.length === 0) {
    return (
      <div className="bg-slate-800/20 border border-slate-800 rounded-3xl p-10 text-center text-slate-600">
        <Network className="h-8 w-8 mx-auto mb-3 opacity-20" />
        <p className="text-[11px] font-bold uppercase tracking-widest opacity-50">AI Detection Offline</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-800 p-8 rounded-3xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-brand-blue/10 rounded-2xl border border-brand-blue/20">
          <BrainCircuit className="h-5 w-5 text-brand-blue" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Isolation Forest Analysis</h3>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Calculating Anomaly Scores for all Devices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {entries.map(([deviceId, info]) => {
          const score = info.last_prediction?.score ?? null;
          const isAnomalous = score !== null && score < -0.3;

          return (
            <div key={deviceId} className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="h-3 w-3 text-brand-blue" />
                <span className="text-[11px] font-bold text-slate-200">{deviceId}</span>
              </div>

              <span className={`text-2xl font-black tabular-nums tracking-tighter ${score === null ? 'text-slate-600' : isAnomalous ? 'text-purple-400' : 'text-emerald-400'
                }`}>
                {score !== null ? score.toFixed(2) : '—'}
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 mt-1">ML Score</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
