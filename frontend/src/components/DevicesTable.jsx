import { Radio, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function DevicesTable({ devices }) {
  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Table Header */}
      <div className="grid grid-cols-3 pb-4 px-4 border-b border-slate-800/50 mb-4">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Device Node</span>
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Infrastructure Type</span>
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Security Status</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        {devices.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-[2rem] py-12">
            <Radio className="h-8 w-8 mb-3 opacity-20 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-50 text-center">
              Scanning Grid Network...<br/>
              No Active Nodes Detected
            </span>
          </div>
        ) : (
          devices.map((d) => (
            <div key={d.device_id} className="group grid grid-cols-3 items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/50 hover:border-brand-blue/30 hover:bg-slate-800/40 transition-all duration-300">
                {/* Column 1: Device */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors shadow-inner">
                          <Radio className="h-3 w-3 text-slate-400 group-hover:text-brand-blue transition-colors" />
                        </div>
                        <div className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-slate-900 shadow-xl ${d.is_blocked ? 'bg-rose-500' : 'bg-emerald-500 shadow-emerald-500/30'}`} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[11px] font-black text-white tracking-tighter leading-none mb-0.5">{d.device_id}</p>
                        <p className="text-[7px] text-slate-500 uppercase tracking-widest font-bold opacity-60">
                          {d.device_name.replace('SMART_METER_', 'NODE ')}
                        </p>
                    </div>
                </div>

                {/* Column 2: Type */}
                <div className="flex justify-center">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-widest border border-blue-500/20 bg-blue-500/10 text-blue-500 transition-all duration-300">
                        {d.device_type}
                    </span>
                </div>

                {/* Column 3: Status */}
                <div className="flex justify-end">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-all duration-500 ${
                      d.is_blocked ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                        {d.is_blocked ? <ShieldAlert className="h-2.5 w-2.5" /> : <ShieldCheck className="h-2.5 w-2.5" />}
                        <span className="text-[11px] font-black tracking-widest uppercase">
                            {d.is_blocked ? 'Blocked' : 'Active'}
                        </span>
                    </div>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
