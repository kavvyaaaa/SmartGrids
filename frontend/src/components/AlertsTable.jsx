import { Bell, AlertTriangle, Lock, KeyRound, Radio, Inbox, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';

function getEventStyle(type) {
  switch (type) {
    case 'FDI': return { color: 'rose', icon: AlertTriangle, label: 'ALRT/FDI', isAttack: true };
    case 'CRYPTO': return { color: 'amber', icon: Lock, label: 'ALRT/SIG', isAttack: true };
    case 'JWT': return { color: 'purple', icon: KeyRound, label: 'ALRT/JWT', isAttack: true };
    case 'REPLAY': return { color: 'indigo', icon: Radio, label: 'ALRT/RPL', isAttack: true };
    case 'READING': return { color: 'blue', icon: Activity, label: 'DATA/TEL', isAttack: false };
    default: return { color: 'slate', icon: Radio, label: 'SYSTEM', isAttack: false };
  }
}

export default function AlertsTable({ alerts }) {
  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_1.5fr_1fr_2fr] gap-4 pb-4 px-4 border-b border-slate-800/50 mb-4">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-left">Device ID</span>
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-left">Timestamp</span>
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Severity</span>
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-left">Reason</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
        {alerts.length === 0 ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-700 gap-3 border border-dashed border-slate-800/50 rounded-[2rem]">
            <Inbox className="h-8 w-8 opacity-10" />
            <span className="text-[11px] font-black uppercase tracking-widest opacity-30">Feed Synchronizing...</span>
          </div>
        ) : (
          alerts.map((a, idx) => {
            const style = getEventStyle(a.type);
            const Icon = style.icon;
            const time = new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            return (
              <div 
                key={`${a.id}-${idx}`} 
                className={`group grid grid-cols-[1fr_1.5fr_1fr_2fr] gap-4 items-center px-4 py-3 rounded-2xl border transition-all duration-300 ${
                  style.isAttack 
                  ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40' 
                  : 'bg-slate-800/20 border-slate-800/50 hover:border-slate-700/50'
                }`}
              >
                {/* Column 1: Device ID */}
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border flex-none ${
                        style.isAttack ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-blue-500/5 border-blue-500/10 text-blue-500/60'
                    }`}>
                        <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-[11px] font-black text-white tracking-tighter">{a.device_id}</span>
                </div>

                {/* Column 2: Timestamp */}
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">{time}</span>

                {/* Column 3: Severity */}
                <div className="flex justify-center flex-col items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-widest border ${
                        style.isAttack ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                        {style.label}
                    </span>
                    {style.isAttack && (!a.mitigated && (Date.now() - new Date(a.timestamp).getTime() < 15000)) && (
                        <span className="text-[6px] font-black text-rose-500 animate-bounce leading-none absolute translate-y-4">BREACH</span>
                    )}
                </div>

                {/* Column 4: Reason */}
                <div className="flex flex-col justify-center">
                    <p className={`text-[11px] font-bold leading-tight ${
                        style.isAttack ? 'text-slate-200' : 'text-slate-400'
                    }`}>
                        {a.detail}
                    </p>
                    {style.isAttack && (
                        <div className={`w-fit mt-1 flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[7px] font-black uppercase tracking-tighter ${
                            a.mitigated 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        }`}>
                            {a.mitigated ? <ShieldCheck className="h-2 w-2" /> : <ShieldAlert className="h-2 w-2" />}
                            {a.mitigated ? 'Active Block' : 'System Fail'}
                        </div>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
