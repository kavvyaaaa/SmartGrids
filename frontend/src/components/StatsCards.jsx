import { Cpu, AlertTriangle, Lock, KeyRound, ShieldCheck, Activity, ShieldAlert } from 'lucide-react';

export default function StatsCards({ dashboard }) {
  const stats = [
    { label: "Meters", val: dashboard.total_devices ?? 0, desc: "Active Nodes", icon: Cpu, color: "blue" },
    { label: "FDI Detected", val: dashboard.fdi_attacks_detected ?? 0, desc: "Anomalies", icon: AlertTriangle, color: "rose" },
    { label: "FDI Blocked", val: dashboard.fdi_mitigated ?? 0, desc: "Auto Mitigate", icon: ShieldCheck, color: "emerald" },
    { label: "Crypto Failures", val: dashboard.crypto_failures ?? 0, desc: "Sign. Mismatch", icon: Lock, color: "amber" },
    { label: "Crypto Blocked", val: dashboard.crypto_mitigated ?? 0, desc: "Auto Mitigate", icon: ShieldAlert, color: "emerald" },
    { label: "JWT Hijacks", val: dashboard.jwt_attacks ?? 0, desc: "Auth Tampers", icon: KeyRound, color: "purple" },
    { label: "Grid Health", val: dashboard.status ?? "Secure", desc: dashboard.defense_active ? "Shield On" : "Shield Off", icon: Activity, color: dashboard.status === "Secure" ? "emerald" : "rose" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {stats.map((s, i) => {
        const Icon = s.icon;
        const color = {
          blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
          amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
          emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        }[s.color];

        return (
          <div key={i} className="bg-slate-800/30 border border-slate-800 p-4 rounded-3xl group hover:border-slate-700 transition-all flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-xl border ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
             </div>
             <div>
                <span className={`text-xl font-black tracking-tighter text-white ${s.color === 'rose' && s.val > 0 ? 'text-rose-400' : ''}`}>{s.val}</span>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5 uppercase tracking-tighter">{s.desc}</p>
             </div>
          </div>
        );
      })}
    </div>
  );
}
