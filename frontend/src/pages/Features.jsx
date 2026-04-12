import {
  ShieldCheck,
  Crosshair,
  ShieldAlert,
  Cpu,
  Terminal,
  Activity,
} from "lucide-react";

export default function Features() {
  const categories = [
    {
      title: "Zero-Trust Integration",
      description:
        "Implementing pervasive verification strategies for all distributed energy resources.",
      icon: ShieldCheck,
      details: [
        "JWT Attacks Detection",
        "Signature Tamper Auditing",
        "Time-stamped Replay Prevention",
      ],
      color: "blue",
    },
    {
      title: "Live Threat Scenarios",
      description: "Execute or analyze cyber attacksin real-time.",
      icon: Crosshair,
      details: [
        "FDI (False Data Injection)",
        "JWT Tampering",
        "Crypto Signature Mismatch",
      ],
      color: "rose",
    },
    {
      title: "Automated Defense",
      description:
        "Predictive grid analytics powered by unsupervised machine learning algorithms.",
      icon: ShieldAlert,
      details: ["Isolation Forest Clustering", "Real-time Event Streaming"],
      color: "emerald",
    },
  ];

  return (
    <div className="bg-slate-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-[11px] font-semibold leading-7 text-brand-blue uppercase tracking-widest">
            Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Defending Grid Operations
          </p>
          <p className="mt-4 text-lg leading-8 text-slate-400 max-w-2xl lg:mx-auto">
            SecureGrids provides an end-to-end framework for securing smart
            energy infrastructure against cyber threats.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="group flex flex-col p-8 bg-slate-800/20 border border-slate-800 rounded-3xl hover:border-brand-blue/30 transition-all hover:-translate-y-2"
            >
              <div className="mb-6 h-12 w-12 flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-700 group-hover:bg-brand-blue/10 group-hover:border-brand-blue/30 transition-all">
                <cat.icon className="h-6 w-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{cat.title}</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed mb-6">
                {cat.description}
              </p>
              <ul className="space-y-3 mt-auto">
                {cat.details.map((detail, dI) => (
                  <li
                    key={dI}
                    className="flex items-center gap-3 text-[11px] text-slate-500"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Technical Insight Section */}
        <div className="mt-32 rounded-3xl bg-slate-800/40 border border-slate-800 p-8 lg:p-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
              <Terminal className="text-brand-blue" />
              Detection Engine Core
            </h3>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="flex gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-brand-blue/30 transition-all">
                <Cpu className="h-6 w-6 text-brand-blue flex-none mt-1" />
                <div>
                  <h4 className="font-semibold text-white text-[13px]">
                    Real-time Isolation Forest
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
                    Establishing behavioral baselines for each meter node
                    through continuous unsupervised training.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-brand-blue/30 transition-all">
                <Activity className="h-6 w-6 text-brand-blue flex-none mt-1" />
                <div>
                  <h4 className="font-semibold text-white text-[13px]">
                    Zero-Latency Event Hub
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
                    Utilizing event-driven WebSocket streams for instantaneous
                    alert propagation across the grid command center.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
