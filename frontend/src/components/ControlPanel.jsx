import { useState } from 'react';
import {
  Crosshair,
  AlertTriangle,
  Lock,
  RotateCcw,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

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
    {
      key: 'fdi',
      label: 'Trigger FDI Attack',
      icon: AlertTriangle,
      cls: 'ctrl-btn--fdi',
      fn: onTriggerFDI,
    },
    {
      key: 'crypto',
      label: 'Tamper Signature',
      icon: Lock,
      cls: 'ctrl-btn--crypto',
      fn: onTriggerCrypto,
    },
    {
      key: 'replay',
      label: 'Replay Attack',
      icon: RotateCcw,
      cls: 'ctrl-btn--replay',
      fn: onTriggerReplay,
    },
    {
      key: 'jwt',
      label: 'JWT Tamper',
      icon: KeyRound,
      cls: 'ctrl-btn--jwt',
      fn: onTriggerJWT,
    },
  ];

  return (
    <div className="panel animate-fade-in">
      <div className="panel__header">
        <Crosshair className="panel__icon" />
        <div>
          <div className="panel__title">Attack Simulation Controls</div>
          <div className="panel__subtitle">
            Trigger attacks to test system resilience
          </div>
        </div>
      </div>

      <p className="controls-description">
        Each button simulates a different cyber-attack vector against the Smart
        Grid. When Active Defense is enabled, the system will automatically
        detect and mitigate the attack.
      </p>

      <div className="controls-grid">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          const isLoading = loading[btn.key];
          return (
            <button
              key={btn.key}
              className={`ctrl-btn ${btn.cls}`}
              disabled={isLoading}
              onClick={() => handleClick(btn.key, btn.fn)}
            >
              <Icon className="ctrl-btn__icon" />
              {isLoading ? 'Triggering...' : btn.label}
            </button>
          );
        })}
      </div>

      {/* Defense Toggle */}
      <div className="defense-toggle-row">
        <div className="defense-toggle-label">
          <ShieldCheck className="defense-toggle-label__icon" />
          Active Defense
        </div>
        <button
          className={`toggle-switch ${defenseActive ? 'toggle-switch--on' : 'toggle-switch--off'}`}
          onClick={onToggleDefense}
          aria-label="Toggle active defense"
        >
          <span className="toggle-switch__knob" />
        </button>
      </div>
    </div>
  );
}
