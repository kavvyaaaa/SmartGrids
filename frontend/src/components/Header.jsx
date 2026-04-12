import { Shield, Wifi, WifiOff, ShieldCheck, ShieldOff } from 'lucide-react';

export default function Header({ health, defenseActive }) {
  const isOnline = health?.status === "running";
  const dbConnected = health?.database === "connected";

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <Shield className="header-logo" />
          <h1 className="header-title">Smart Grid Security Dashboard</h1>
        </div>

        <div className="header-badges">
          {/* Backend Status */}
          <span className={`badge ${isOnline ? 'badge--online' : 'badge--offline'}`}>
            <span className={`badge-dot ${isOnline ? 'badge-dot--green' : 'badge-dot--red'}`} />
            {isOnline ? (
              <>
                {dbConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                Backend Online
              </>
            ) : (
              <>
                <WifiOff size={12} />
                Backend Offline
              </>
            )}
          </span>

          {/* Defense Status */}
          <span className={`badge ${defenseActive ? 'badge--defense-on' : 'badge--defense-off'}`}>
            <span className={`badge-dot ${defenseActive ? 'badge-dot--blue' : 'badge-dot--amber'}`} />
            {defenseActive ? (
              <>
                <ShieldCheck size={12} />
                Defense Active
              </>
            ) : (
              <>
                <ShieldOff size={12} />
                Defense Off
              </>
            )}
          </span>
        </div>
      </div>
    </header>
  );
}
