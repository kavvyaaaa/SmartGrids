import { Link } from "react-router-dom";
import { Shield, Lock, Zap, ChevronRight, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-slate-900">
      {/* Background Decor */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-10 pb-20 sm:pb-24 lg:px-8 lg:py-32 flex flex-col items-center text-center">
        <div className="mx-auto max-w-3xl flex-shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Smarter Grids.{" "}
            <span className="text-brand-blue"> Stronger Security. </span> Zero
            Trust.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
            A specialized simulation platform for triggering, monitoring, and
            defeating cyber-physical attacks on energy infrastructure.
            Integrated with real-time AI updates.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-8">
            <Link
              to="/dashboard"
              className="rounded-xl bg-brand-blue px-8 py-4 text-sm font-semibold text-white shadow-xl hover:bg-blue-600 transition-all active:scale-95 shadow-blue-500/10"
            >
              Access Dashboard
            </Link>
            <Link
              to="/features"
              className="text-sm font-semibold leading-6 text-slate-200 flex items-center gap-1 group"
            >
              Explore capabilities{" "}
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Section Preview */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Lock,
              title: "Zero-Trust Protocol",
              desc: "Continuous verification of every device that is active in the grid.",
            },
            {
              icon: Activity,
              title: "Attack Simulation",
              desc: "Trigger complex FDI, Replay, and JWT Attacks in grid environment.",
            },
            {
              icon: Zap,
              title: "ML Protection",
              desc: "Unsupervised Isolation Forest algorithm trains in real-time to prevent anomalies.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-8 bg-slate-800/20 border border-slate-800 rounded-3xl hover:border-brand-blue/50 transition-colors"
            >
              <div className="p-3 w-fit bg-brand-blue/10 border border-brand-blue/20 rounded-xl">
                <feature.icon className="h-6 w-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
