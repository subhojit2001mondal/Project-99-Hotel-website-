import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { seedDemoData } from '../../services/db';
import {
  Compass,
  LayoutDashboard,
  Building,
  Palmtree,
  Users2,
  Car,
  CalendarCheck,
  Users,
  Ticket,
  Star,
  FileSpreadsheet,
  Settings,
  Database,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, profile, role, isAdmin, isAgent, logout, quickLogin } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // If not signed in or not staff, display access barrier with 1-click Super Admin login
  if (!user || (!isAdmin && !isAgent)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-6 text-white shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black font-heading">Illusion Administration</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Restricted portal. Only authorized administrators and tour agents can access the management console.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/80 text-xs text-slate-300 space-y-2 text-left">
            <span className="font-bold text-orange-400 block uppercase tracking-wider text-[10px]">
              Platform Super Admin:
            </span>
            <p className="font-mono text-xs">Email: <span className="text-white">Roysahil579@gmail.com</span></p>
            <p className="font-mono text-xs">Password: <span className="text-white">Illusio@006574</span></p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  await quickLogin('super_admin');
                  showToast('Authenticated as Super Admin!', 'success');
                } catch (e: any) {
                  showToast(e.message || 'Login failed', 'error');
                }
              }}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>1-Click Sign In as Super Admin (Roysahil579@gmail.com)</span>
            </button>

            <Link
              to="/"
              className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors block"
            >
              ← Return to Customer App
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSeedDemoData = async () => {
    if (confirm('Load sample hotels, tour packages, room inventory, agents, and coupons into Firestore?')) {
      setSeeding(true);
      try {
        const res = await seedDemoData(true);
        if (res.success) {
          showToast(res.message, 'success');
          // Reload page to refresh state
          window.location.reload();
        } else {
          showToast(res.message, 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Seeding failed', 'error');
      } finally {
        setSeeding(false);
      }
    }
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/hotels', label: 'Hotels & Rooms', icon: Building },
    { path: '/admin/packages', label: 'Tour Packages', icon: Palmtree },
    { path: '/admin/agents', label: 'Tour Agents', icon: Users2 },
    { path: '/admin/services', label: 'Travel Services', icon: Car },
    { path: '/admin/bookings', label: 'Bookings & Refunds', icon: CalendarCheck },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/offers', label: 'Coupons & Banners', icon: Ticket },
    { path: '/admin/reviews', label: 'Reviews Moderation', icon: Star },
    { path: '/admin/reports', label: 'CSV Reports', icon: FileSpreadsheet },
    { path: '/admin/settings', label: 'Settings & Audit', icon: Settings }
  ];

  const isCurrentActive = (itemPath: string, exact?: boolean) => {
    if (exact) return location.pathname === itemPath;
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="h-18 px-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white font-heading">
                  Illusion<span className="text-orange-500">.</span>
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-0.5">
                  Management
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {navItems.map((item) => {
              const active = isCurrentActive(item.path, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Info & Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-sky-900 text-white font-bold flex items-center justify-center font-heading text-xs shrink-0">
              {profile?.fullName ? profile.fullName.charAt(0) : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{profile?.fullName}</p>
              <span className="text-[9px] uppercase font-bold text-orange-400">{role.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Web App</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/40 text-rose-300 hover:text-rose-100 text-[11px] font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-18 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
              Illusion Control Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Load Demo Data Seeder Button */}
            <button
              type="button"
              disabled={seeding}
              onClick={handleSeedDemoData}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md shadow-orange-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              title="Loads demo hotels, tour packages, coupons, and services"
            >
              <Database className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Seeding Catalog...' : 'Load Demo Data'}</span>
            </button>

            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span>Customer View</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 bg-slate-900/60">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
