import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Shield className="h-7 w-7 text-brand-blue group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                SecureGrids
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-brand-blue ${location.pathname === link.path ? 'text-brand-blue' : 'text-slate-300'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
