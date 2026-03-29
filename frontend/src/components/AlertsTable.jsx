import {
  Bell,
  AlertTriangle,
  Lock,
  KeyRound,
  Radio,
  Inbox,
} from 'lucide-react';

function getTypeInfo(type) {
  switch (type) {
    case 'FDI_ATTACK':
      return { cls: 'type-badge--fdi', Icon: AlertTriangle, label: 'FDI' };
    case 'CRYPTO_ATTACK':
      return { cls: 'type-badge--crypto', Icon: Lock, label: 'CRYPTO' };
    case 'JWT_ATTACK':
      return { cls: 'type-badge--jwt', Icon: KeyRound, label: 'JWT' };
    default:
      return { cls: 'type-badge--normal', Icon: Radio, label: 'READING' };
  }
}

function getSeverity(alert) {
  if (
    alert.type === 'FDI_ATTACK' ||
    alert.type === 'CRYPTO_ATTACK' ||
    alert.type === 'JWT_ATTACK'
  ) {
    return { cls: 'severity--high', label: 'HIGH' };
  }
  const match = alert.detail ? alert.detail.match(/(\d+(\.\d+)?)/) : null;
  const kwh = match ? parseFloat(match[1]) : 0;
  if (kwh > 150) return { cls: 'severity--medium', label: 'MEDIUM' };
  if (kwh > 100) return { cls: 'severity--low', label: 'LOW' };
  return { cls: 'severity--safe', label: 'SAFE' };
}

export default function AlertsTable({ alerts }) {
  return (
    <div className="panel animate-fade-in">
      <div className="panel__header">
        <Bell className="panel__icon" />
        <div>
          <div className="panel__title">Security Alerts</div>
          <div className="panel__subtitle">Live event feed from all detectors</div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <Inbox className="empty-state__icon" />
          <span>No alerts yet</span>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Device</th>
                <th>Time</th>
                <th>Severity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a, idx) => {
                const typeInfo = getTypeInfo(a.type);
                const sev = getSeverity(a);
                const Icon = typeInfo.Icon;
                const time = new Date(a.timestamp).toLocaleTimeString();
                return (
                  <tr key={`${a.id}-${a.type}-${idx}`}>
                    <td>
                      <span className={`type-badge ${typeInfo.cls}`}>
                        <Icon className="type-badge__icon" />
                        {typeInfo.label}
                      </span>
                    </td>
                    <td>{a.device_id}</td>
                    <td>{time}</td>
                    <td>
                      <span className={`severity ${sev.cls}`}>{sev.label}</span>
                    </td>
                    <td>{a.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
