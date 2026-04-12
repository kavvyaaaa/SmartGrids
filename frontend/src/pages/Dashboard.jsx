import { useState, useEffect, useCallback } from "react";
import StatsCards from "../components/StatsCards";
import EnergyChart from "../components/EnergyChart";
import ControlPanel from "../components/ControlPanel";
import AlertsTable from "../components/AlertsTable";
import DevicesTable from "../components/DevicesTable";
import MLStatus from "../components/MLStatus";
import AlertBanner from "../components/AlertBanner";
import { Activity, Database, RefreshCw } from "lucide-react";

const API_BASE = "http://127.0.0.1:5000/api";

const BentoCard = ({ children, className = "", title, icon: Icon, action }) => (
  <div className={`bg-slate-900/50 backdrop-blur-md border border-slate-800/60 rounded-[2rem] p-6 shadow-2xl transition-all duration-300 hover:border-slate-700/50 group ${className}`}>
    {title && (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-brand-blue/10 border border-brand-blue/20">
              <Icon className="h-4 w-4 text-brand-blue" />
            </div>
          )}
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export default function Dashboard() {
  const [health, setHealth] = useState({ status: "offline", database: "disconnected" });
  const [dashboard, setDashboard] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [mlStatus, setMlStatus] = useState({});
  const [banner, setBanner] = useState({ visible: false, message: "", type: "info" });
  const [chartData, setChartData] = useState([]);

  const fetchData = useCallback(async (endpoint, setter) => {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}?t=${Date.now()}`);
      const data = await res.json();
      setter(data);
    } catch {
      console.warn(`Fetch failed for ${endpoint}`);
    }
  }, []);

  const fetchAll = useCallback(() => {
    fetchData("health", setHealth);
    fetchData("security-dashboard", setDashboard);
    fetchData("fdi-alerts", (data) => setAlerts(Array.isArray(data) ? data : []));
    fetchData("devices", (data) => setDevices(Array.isArray(data) ? data : []));
    fetchData("ml-status", setMlStatus);
  }, [fetchData]);

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, 5000);
    return () => clearInterval(timer);
  }, [fetchAll]);

  useEffect(() => {
    if (health.status !== "running" || alerts.length === 0) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Calculate real average grid load from the most recent batch of readings
    const recentReadings = alerts.filter(a => a.type === 'READING').slice(0, 7);
    let currentLoad = 30; // default fallback
    if (recentReadings.length > 0) {
      currentLoad = recentReadings.reduce((sum, r) => {
        const value = parseFloat(r.detail.match(/[\d.]+/)?.[0] || 0);
        return sum + value;
      }, 0) / recentReadings.length;
    }

    // Determine if an FDI attack is currently active (within the last 15 seconds)
    // Ignore CRYPTO, JWT, and REPLAY attacks for the energy chart
    const hasRecentFDI = alerts.some(a => {
      if (a.type !== 'FDI') return false;
      const age = Date.now() - new Date(a.timestamp).getTime();
      return age < 15000;
    });

    setChartData(prev => {
      // Prevent stacking duplicate time points if updates are too fast
      if (prev.length > 0 && prev[prev.length - 1].time === now) {
        return prev;
      }
      return [
        ...prev,
        {
          time: now,
          normal: parseFloat(currentLoad.toFixed(2)),
          anomaly: hasRecentFDI ? parseFloat((currentLoad * (1.5 + Math.random())).toFixed(2)) : null
        }
      ].slice(-30);
    });

  }, [alerts, health.status]);

  const showBanner = (message, type = "info") => {
    setBanner({ visible: true, message, type });
    setTimeout(() => setBanner(prev => ({ ...prev, visible: false })), 5000);
  };

  const triggerAttack = async (endpoint, label) => {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`);
      const data = await res.json();
      if (res.ok) {
        const mitigated = data.defense_result?.mitigated;
        showBanner(mitigated ? `${label} Mitigated!` : `${label} Detected!`, mitigated ? "success" : "danger");
        fetchAll();
      }
    } catch {
      showBanner("Attack Trigger Failed", "danger");
    }
  };

  const toggleDefense = async () => {
    try {
      const res = await fetch(`${API_BASE}/toggle-defense`);
      const data = await res.json();
      setDashboard(prev => ({ ...prev, defense_active: data.defense_active }));
      showBanner(data.defense_active ? "Defense Engaged" : "Defense Terminated", "info");
    } catch {
      showBanner("Defense Toggle Error", "danger");
    }
  };

  const isOnline = health.status !== "offline";

  return (
    <div className="bg-slate-900 min-h-screen p-6 lg:p-10 space-y-10 selection:bg-brand-blue/20">
      <AlertBanner visible={banner.visible} message={banner.message} type={banner.type} />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            <Activity className="h-10 w-10 text-brand-blue" />
            Security Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-2">Control Panel</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/30 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse'}`} />
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{health.status}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <Database className={`h-3.5 w-3.5 ${health.database === 'connected' ? 'text-emerald-500' : 'text-rose-500'}`} />
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{health.database}</span>
          </div>
          <button onClick={fetchAll} className="p-3 text-slate-500 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all active:scale-90">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

        {/* Row 1: Key Performance Metrics */}
        <div className="xl:col-span-12">
          <StatsCards dashboard={dashboard} />
        </div>

        {/* Row 2: Live Telemetry & Alert Table */}
        <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BentoCard className="flex flex-col pt-8 h-[400px]" title="Energy Consumption">
            <div className="flex-1 h-[280px]">
              <EnergyChart data={chartData} isOnline={isOnline} />
            </div>
          </BentoCard>

          <BentoCard className="overflow-hidden flex flex-col h-[400px]" title="Alert Table" icon={Activity}>
            <div className="flex-1 overflow-hidden">
              <AlertsTable alerts={alerts} />
            </div>
          </BentoCard>
        </div>

        {/* Row 3: Controls & Infrastructure */}
        <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BentoCard title="Simulation Controls" className="h-[400px]">
            <ControlPanel
              onTriggerFDI={() => triggerAttack("trigger-fdi-attack", "FDI Inject")}
              onTriggerCrypto={() => triggerAttack("tamper-signature", "Crypto Fail")}
              onTriggerReplay={() => triggerAttack("trigger-replay-attack", "Replay Pkt")}
              onTriggerJWT={() => triggerAttack("trigger-jwt-tamper", "JWT Hijack")}
              onToggleDefense={toggleDefense}
              defenseActive={dashboard.defense_active}
            />
          </BentoCard>

          <BentoCard
            title="SMART METERS"
            className="h-[400px] overflow-hidden flex flex-col"
            icon={Database}
            action={
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-[11px] font-black tracking-widest uppercase text-emerald-400">
                  {devices.filter(d => !d.is_blocked).length} Active
                </span>
              </div>
            }
          >
            <div className="flex-1 overflow-hidden">
              <DevicesTable devices={devices} />
            </div>
          </BentoCard>
        </div>

        {/* Row 4: AI Forensic Logic */}
        <div className="xl:col-span-12">
          <BentoCard title="Machine Learning Forensic Nodes">
            <MLStatus mlStatus={mlStatus} />
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
