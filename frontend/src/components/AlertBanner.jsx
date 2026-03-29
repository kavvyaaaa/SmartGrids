import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function AlertBanner({ visible, message, type }) {
  if (!visible) return null;

  const Icon = type === 'success' ? ShieldCheck : type === 'warning' ? ShieldAlert : AlertTriangle;

  return (
    <div className={`alert-banner alert-banner--${type}`}>
      <Icon size={18} />
      {message}
    </div>
  );
}
