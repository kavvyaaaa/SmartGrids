import { Cpu, AlertTriangle, Lock, KeyRound, Activity, ShieldCheck } from 'lucide-react';

export default function StatsCards({ dashboard }) {
  const cards = [
    {
      label: "Total Devices",
      value: dashboard.total_devices ?? 0,
      icon: Cpu,
      color: "blue",
    },
    {
      label: "FDI Attacks",
      value: dashboard.fdi_attacks_detected ?? 0,
      icon: AlertTriangle,
      color: "rose",
    },
    {
      label: "Crypto Failures",
      value: dashboard.crypto_failures ?? 0,
      icon: Lock,
      color: "amber",
    },
    {
      label: "JWT Attacks",
      value: dashboard.jwt_attacks ?? 0,
      icon: KeyRound,
      color: "purple",
    },
    {
      label: "FDI Mitigated",
      value: dashboard.fdi_mitigated ?? 0,
      icon: ShieldCheck,
      color: "emerald",
    },
    {
      label: "System Status",
      value: dashboard.status ?? "Unknown",
      icon: Activity,
      color: dashboard.status === "Secure" ? "emerald" : "rose",
      isStatus: true,
    },
  ];

  return (
    <section className="stats-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`stat-card stat-card--${card.color} animate-fade-in`}
          >
            <div className="stat-card__header">
              <Icon className="stat-card__icon" />
              <span className="stat-card__label">{card.label}</span>
            </div>
            <div
              className={`stat-card__value ${
                card.isStatus
                  ? card.value === "Secure"
                    ? "stat-card__value--secure"
                    : "stat-card__value--attack"
                  : `stat-card__value--${card.color}`
              }`}
            >
              {card.value}
            </div>
          </div>
        );
      })}
    </section>
  );
}
