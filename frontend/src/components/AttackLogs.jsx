import { ShieldAlert, AlertTriangle, Lock, Key, RotateCcw } from "lucide-react";

const attackIcons = {
  FDI: <AlertTriangle className="type-badge__icon" />,
  JWT_AUTHENTICATION: <Key className="type-badge__icon" />,
  CRYPTO_TAMPERING: <Lock className="type-badge__icon" />,
  REPLAY: <RotateCcw className="type-badge__icon" />,
  ANOMALY: <AlertTriangle className="type-badge__icon" />,
};

const attackColors = {
  FDI: "type-badge--fdi",
  JWT_AUTHENTICATION: "type-badge--jwt",
  CRYPTO_TAMPERING: "type-badge--crypto",
  REPLAY: "type-badge--replay",
  ANOMALY: "type-badge--fdi",
};

function AttackLogs({ logs }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="panel animate-fade-in">
      <div className="panel__header">
        <ShieldAlert className="panel__icon" style={{ color: "var(--accent-rose)" }} />
        <div>
          <div className="panel__title">Live Attack Feed</div>
          <div className="panel__subtitle">Real-time security events via WebSocket</div>
        </div>
        <span className="ws-live-badge">
          <span className="ws-live-dot"></span>
          LIVE
        </span>
      </div>
      <div className="table-scroll" style={{ maxHeight: "300px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Meter</th>
              <th>Attack Type</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => {
              const attackType = log.attack_type || log.type || "UNKNOWN";
              return (
                <tr key={i} className="attack-log-row">
                  <td style={{ whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                    {log.time ? new Date(log.time).toLocaleTimeString("en-US", { hour12: false }) : "-"}
                  </td>
                  <td>
                    <span style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
                      {log.meter_id}
                    </span>
                  </td>
                  <td>
                    <span className={`type-badge ${attackColors[attackType] || ""}`}>
                      {attackIcons[attackType] || <ShieldAlert className="type-badge__icon" />}
                      {attackType.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "var(--text-muted)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {log.details || log.rejection_reason || log.message || `Score: ${log.anomaly_score || "-"}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttackLogs;
