import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthModal } from '../auth/AuthModal';
import {
  Compass,
  MapPin,
  Luggage,
  Heart,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Ticket
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, profile, role, isAdmin, isAgent, isVerified, logout, resendVerification } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All Destinations');

  const popularCities = ['All Destinations', 'Goa', 'Jaipur', 'Manali', 'Kerala', 'Udaipur', 'Mumbai'];

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCitySelectorOpen(false);
    if (city === 'All Destinations') {
      navigate('/hotels');
    } else {
      navigate(`/hotels?city=${encodeURIComponent(city)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserDropdownOpen(false);
      showToast('Signed out safely. Have a wonderful day!', 'info');
      navigate('/');
    } catch {
      showToast('Error logging out', 'error');
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await resendVerification();
      showToast('Verification email resent! Please check your inbox.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to send verification email.', 'error');
    }
  };

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <>
      {/* Unverified Email Warning Banner */}
      {user && !isVerified && (
        <div className="bg-amber-500 text-sky-950 px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 mx-auto">
            <ShieldAlert className="w-4 h-4 shrink-0 text-sky-950" />
            <span>
              Your email is not verified yet. You can browse, but email verification is required to complete bookings.
            </span>
            <button
              onClick={handleVerifyEmail}
              className="underline font-bold hover:text-white transition-colors ml-1"
            >
              Resend Verification Link
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo and City Selector */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-950 via-blue-900 to-sky-800 flex items-center justify-center text-white shadow-md shadow-sky-950/20 group-hover:scale-105 transition-transform">
                  <Compass className="w-6 h-6 text-orange-400 group-hover:rotate-45 transition-transform duration-500" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold tracking-tight font-heading text-sky-950">
                    Illusion<span className="text-orange-600">.</span>
                  </span>
                  <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                    Luxury Stays & Tours
                  </span>
                </div>
              </Link>

              {/* City Destination Quick Selector */}
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>{selectedCity}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {citySelectorOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Popular Hubs
                    </div>
                    {popularCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-orange-50 hover:text-orange-700 flex items-center justify-between ${
                          selectedCity === city ? 'bg-orange-50/80 text-orange-600 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        {city}
                        {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/hotels"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/hotels')
                    ? 'text-orange-600 bg-orange-50/80'
                    : 'text-slate-600 hover:text-sky-950 hover:bg-slate-100/60'
                }`}
              >
                Hotels & Resorts
              </Link>
              <Link
                to="/packages"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/packages')
                    ? 'text-orange-600 bg-orange-50/80'
                    : 'text-slate-600 hover:text-sky-950 hover:bg-slate-100/60'
                }`}
              >
                Tour Packages
              </Link>
              <Link
                to="/services"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/services')
                    ? 'text-orange-600 bg-orange-50/80'
                    : 'text-slate-600 hover:text-sky-950 hover:bg-slate-100/60'
                }`}
              >
                Cabs & Activities
              </Link>
              <Link
                to="/offers"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/offers')
                    ? 'text-orange-600 bg-orange-50/80'
                    : 'text-slate-600 hover:text-sky-950 hover:bg-slate-100/60'
                }`}
              >
                <Ticket className="w-4 h-4 text-orange-500" />
                Offers
              </Link>
            </nav>

            {/* Right Action Icons & Auth Profile */}
            <div className="flex items-center gap-3">
              {/* Currency Badge */}
              <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                ₹ INR
              </span>

              {/* Install App / Android Play Store button */}
              <PWAInstallButton />

              {/* Wishlist */}
              {user && (
                <Link
                  to="/wishlist"
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors relative"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              {/* My Trips */}
              {user && (
                <Link
                  to="/my-trips"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-sky-950 hover:bg-slate-100 rounded-xl transition-all"
                  title="My Trips"
                >
                  <Luggage className="w-4 h-4 text-sky-800" />
                  <span>My Trips</span>
                </Link>
              )}

              {/* Admin Panel Direct Link for Admin / Agent */}
              {(isAdmin || isAgent) && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-sky-950 to-blue-900 text-white hover:from-sky-900 hover:to-blue-800 rounded-xl shadow-xs transition-all border border-sky-800"
                >
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* User Account / Profile or Sign In */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden xl:block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {profile?.fullName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden xl:block" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-fade-in"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{profile?.fullName}</p>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              role === 'super_admin'
                                ? 'bg-purple-100 text-purple-800'
                                : role === 'admin'
                                ? 'bg-sky-100 text-sky-800'
                                : role === 'agent'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-950"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Profile & Saved Travelers
                        </Link>
                        <Link
                          to="/my-trips"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-950"
                        >
                          <Luggage className="w-4 h-4 text-slate-400" />
                          My Trips & Vouchers
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-950"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          Saved Wishlist
                        </Link>

                        {(isAdmin || isAgent) && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-sky-900 bg-sky-50/60 hover:bg-sky-100"
                          >
                            <ShieldCheck className="w-4 h-4 text-orange-600" />
                            Admin Management Portal
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-bold text-sky-950 hover:text-orange-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs transition-all shadow-orange-600/20"
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Mobile hamburger toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              <Link
                to="/hotels"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold hover:bg-orange-50 hover:text-orange-600"
              >
                🏨 Hotels & Resorts
              </Link>
              <Link
                to="/packages"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold hover:bg-orange-50 hover:text-orange-600"
              >
                🌴 Tour Packages
              </Link>
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold hover:bg-orange-50 hover:text-orange-600"
              >
                🚗 Cabs & Activities
              </Link>
              <Link
                to="/offers"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold hover:bg-orange-50 hover:text-orange-600"
              >
                🏷️ Deals & Coupons
              </Link>
            </div>

            <div className="pt-1 pb-2">
              <PWAInstallButton isMobile={true} />
            </div>

            {user && (
              <div className="space-y-1">
                <Link
                  to="/my-trips"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Luggage className="w-4 h-4 text-sky-800" />
                  My Trips & Bookings
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Heart className="w-4 h-4 text-rose-600" />
                  Saved Wishlist
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  My Profile
                </Link>
                {(isAdmin || isAgent) && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-sky-900 bg-sky-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    Admin Portal (/admin)
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authMode} />
    </>
  );
};
