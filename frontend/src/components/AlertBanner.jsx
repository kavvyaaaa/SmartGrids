import { AlertTriangle, ShieldCheck, ShieldAlert, Info } from 'lucide-react';

export default function AlertBanner({ visible, message, type }) {
  if (!visible) return null;

  const config = {
    success: { icon: ShieldCheck, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30 text-emerald-400' },
    danger: { icon: AlertTriangle, bg: 'bg-rose-500/10', border: 'border-rose-500/30 text-rose-400' },
    warning: { icon: ShieldAlert, bg: 'bg-amber-500/10', border: 'border-amber-500/30 text-amber-400' },
    info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30 text-blue-400' },
  }[type] || { icon: Info, bg: 'bg-slate-800/10', border: 'border-slate-800 text-slate-400' };

  const Icon = config.icon;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
       <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-md shadow-2xl ${config.bg} ${config.border}`}>
          <Icon className="h-4 w-4 flex-none" />
          <span className="text-[11px] font-bold tracking-tight">{message}</span>
       </div>
    </div>
  );
}
