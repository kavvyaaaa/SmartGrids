import { Link } from "react-router-dom";
import { Terminal, Globe, Briefcase, Mail, Heart } from "lucide-react";

const navigation = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Security", href: "/security" },
    { name: "Dashboard", href: "/dashboard" },
  ],
  resources: [
    { name: "Documentation", href: "#" },
    { name: "API Reference", href: "#" },
  ],
  company: [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ],
};

const socials = [
  {
    name: "GitHub",
    icon: Globe,
    href: "https://github.com/kavvyaaaa/SmartGrids",
  },
  {
    name: "LinkedIn",
    icon: Briefcase,
    href: "https://www.linkedin.com/in/kavvyaaaa/",
  },
  { name: "Email", icon: Mail, href: "mailto:support@securegrids.com" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand column */}
          <div className="space-y-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-brand-blue font-bold text-xl tracking-tight"
            >
              <Terminal className="h-6 w-6" />
              <span>SecureGrids</span>
            </Link>
            <p className="text-[11px] leading-6 text-slate-400 max-w-xs">
              Smart Grid Cybersecurity — Zero-Trust Architecture and defenses
              against FDI, Replay, and JWT hijacking attacks in a simulated grid
              environment.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400
                    hover:bg-brand-blue/10 hover:text-brand-blue
                    transition-all duration-200"
                  aria-label={s.name}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 sm:grid-cols-4">
            {Object.entries(navigation).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-[11px] font-semibold text-white uppercase tracking-wider">
                  {category}
                </h3>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-[11px] text-slate-400 hover:text-brand-blue transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            &copy; 2026 SecureGrids. Made with{" "}
            <Heart className="h-3.5 w-3.5 text-rose-500 inline" /> by the Team.
          </p>
          <p className="text-[11px] text-slate-600">
            Secure Smart Grid Environment
          </p>
        </div>
      </div>
    </footer>
  );
}
