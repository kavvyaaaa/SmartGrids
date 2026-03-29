import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import EnergyChart from "./components/EnergyChart";
import ControlPanel from "./components/ControlPanel";
import AlertsTable from "./components/AlertsTable";
import DevicesTable from "./components/DevicesTable";
import MLStatus from "./components/MLStatus";
import AlertBanner from "./components/AlertBanner";
import "./App.css";

const API_BASE = "http://127.0.0.1:5000/api";

function App() {
  const [health, setHealth] = useState({
    status: "offline",
    database: "disconnected",
  });
  const [dashboard, setDashboard] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [mlStatus, setMlStatus] = useState({});
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerType, setBannerType] = useState("danger");
  const [chartData, setChartData] = useState([]);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({ status: "offline", database: "disconnected" });
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/security-dashboard`);
      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/fdi-alerts`);
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error("Alerts fetch failed", err);
    }
  }, []);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/devices`);
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      console.error("Devices fetch failed", err);
    }
  }, []);

  const fetchMLStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/ml-status`);
      const data = await res.json();
      setMlStatus(data);
    } catch (err) {
      console.error("ML status fetch failed", err);
    }
  }, []);

  const isOnline = health?.status === "running";

  // Simulated chart data for live visualization — only when backend is online
  const updateChartData = useCallback(() => {
    if (!isOnline) return;
    const now = new Date();
    const timeLabel = now.toLocaleTimeString("en-US", { hour12: false });
    const normalVal = 30 + Math.random() * 20;
    const hasAttack = dashboard.status === "Under Attack";

    setChartData((prev) => {
      const next = [
        ...prev,
        {
          time: timeLabel,
          normal: parseFloat(normalVal.toFixed(2)),
          anomaly: hasAttack
            ? parseFloat((normalVal * (3 + Math.random())).toFixed(2))
            : null,
        },
      ];
      return next.slice(-25);
    });
  }, [dashboard.status, isOnline]);

  useEffect(() => {
    fetchHealth();
    fetchDevices();
    fetchDashboard();
    fetchAlerts();
    fetchMLStatus();

    const intervals = [
      setInterval(fetchHealth, 10000),
      setInterval(fetchDashboard, 5000),
      setInterval(fetchAlerts, 5000),
      setInterval(fetchMLStatus, 15000),
      setInterval(updateChartData, 4000),
    ];

    // Initial chart seed
    updateChartData();

    return () => intervals.forEach(clearInterval);
  }, [
    fetchHealth,
    fetchDashboard,
    fetchAlerts,
    fetchDevices,
    fetchMLStatus,
    updateChartData,
  ]);

  const showBanner = (message, type = "danger") => {
    setBannerMessage(message);
    setBannerType(type);
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 5000);
  };

  const triggerAttack = async (endpoint, label) => {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`);
      const data = await res.json();
      if (res.ok) {
        const mitigated = data.defense_result?.mitigated;
        if (mitigated) {
          showBanner(
            `${label} detected and MITIGATED by active defense!`,
            "success",
          );
        } else {
          showBanner(`${label} detected!`, "danger");
        }
        fetchDashboard();
        fetchAlerts();
        fetchMLStatus();
      }
      return data;
    } catch (err) {
      showBanner(`Failed to trigger ${label}`, "danger");
      return null;
    }
  };

  const toggleDefense = async () => {
    try {
      const res = await fetch(`${API_BASE}/toggle-defense`);
      const data = await res.json();
      setDashboard((prev) => ({
        ...prev,
        defense_active: data.defense_active,
      }));
      showBanner(
        data.defense_active
          ? "Active Defense ENABLED"
          : "Active Defense DISABLED",
        data.defense_active ? "success" : "warning",
      );
    } catch {
      showBanner("Failed to toggle defense", "danger");
    }
  };

  return (
    <div className="app-container">
      <AlertBanner
        visible={bannerVisible}
        message={bannerMessage}
        type={bannerType}
      />
      <Header health={health} defenseActive={dashboard.defense_active} />

      <main className="main-content">
        <StatsCards dashboard={dashboard} />

        <div className="content-grid">
          <div className="content-col content-col--left">
            <EnergyChart data={chartData} isOnline={isOnline} />
            <ControlPanel
              onTriggerFDI={() =>
                triggerAttack("trigger-fdi-attack", "FDI Attack")
              }
              onTriggerCrypto={() =>
                triggerAttack("tamper-signature", "Crypto Signature Tampering")
              }
              onTriggerReplay={() =>
                triggerAttack("trigger-replay-attack", "Replay Attack")
              }
              onTriggerJWT={() =>
                triggerAttack("trigger-jwt-tamper", "JWT Tamper Attack")
              }
              onToggleDefense={toggleDefense}
              defenseActive={dashboard.defense_active}
            />
          </div>
          <div className="content-col content-col--right">
            <AlertsTable alerts={alerts} />
            <DevicesTable devices={devices} />
          </div>
        </div>

        <MLStatus mlStatus={mlStatus} />
      </main>
    </div>
  );
}

export default App;
