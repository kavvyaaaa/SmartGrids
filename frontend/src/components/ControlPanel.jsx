import { useState } from 'react';
import { Crosshair, AlertTriangle, Lock, RotateCcw, KeyRound } from 'lucide-react';

export default function ControlPanel({
  onTriggerFDI,
  onTriggerCrypto,
  onTriggerReplay,
  onTriggerJWT,
  onToggleDefense,
  defenseActive,
}) {
  const [loading, setLoading] = useState({});

  const handleClick = async (key, fn) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await fn();
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const buttons = [
    { key: 'fdi', label: 'FDI Attack', icon: AlertTriangle, color: 'rose', fn: onTriggerFDI },
    { key: 'crypto', label: 'Tamper Attack', icon: Lock, color: 'amber', fn: onTriggerCrypto },
    { key: 'replay', label: 'Replay Attack', icon: RotateCcw, color: 'indigo', fn: onTriggerReplay },
    { key: 'jwt', label: 'JWT Attack', icon: KeyRound, color: 'purple', fn: onTriggerJWT },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-blue/10 rounded-2xl border border-brand-blue/20">
            <Crosshair className="h-6 w-6 text-brand-blue" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Attack Simulation</h3>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mt-1"></p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/60 p-2 pl-5 rounded-2xl border border-slate-800">
          <div className="flex flex-col text-right">
            <span className="text-[11px] uppercase font-bold tracking-widest text-slate-500">Defense</span>
            <span className={`text-[11px] font-bold leading-tight ${defenseActive ? 'text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'text-slate-400'}`}>
              {defenseActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <button
            onClick={onToggleDefense}
            className={`relative inline-flex h-10 w-16 items-center rounded-xl transition-all duration-300 focus:outline-none ${defenseActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-lg bg-white shadow-md transition-transform duration-300 ${defenseActive ? 'translate-x-9' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          const isLoading = loading[btn.key];

          const variant = {
            rose: 'border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40',
            amber: 'border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/40',
            indigo: 'border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/10 hover:border-indigo-500/40',
            purple: 'border-purple-500/20 text-purple-500 hover:bg-purple-500/10 hover:border-purple-500/40',
          }[btn.color];

          return (
            <button
              key={btn.key}
              disabled={isLoading}
              onClick={() => handleClick(btn.key, btn.fn)}
              className={`flex flex-col items-center justify-center py-5 min-h-[80px] rounded-2xl bg-slate-900/40 border transition-all ${variant} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              <div className="mb-2">
                <Icon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-widest">{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
