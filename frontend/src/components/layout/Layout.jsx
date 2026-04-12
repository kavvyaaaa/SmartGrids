import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Standard Layout wrapper for consistent branding and navigation.
 */
export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 selection:bg-brand-blue/30 overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
