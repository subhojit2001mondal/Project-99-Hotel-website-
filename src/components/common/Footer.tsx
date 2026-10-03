import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Headphones, RefreshCw, Award, Send, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-900/40 border border-sky-800/40 text-orange-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Best Price Guarantee</h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct luxury hotel rates</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-900/40 border border-sky-800/40 text-orange-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">100% Verified Stays</h4>
              <p className="text-xs text-slate-400 mt-0.5">Strict quality inspections</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-900/40 border border-sky-800/40 text-orange-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Flexible Cancellation</h4>
              <p className="text-xs text-slate-400 mt-0.5">Instant refunds to account</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-900/40 border border-sky-800/40 text-orange-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">24/7 VIP Concierge</h4>
              <p className="text-xs text-slate-400 mt-0.5">Personal travel assistant</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12 border-b border-slate-900">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white font-heading">
                Illusion<span className="text-orange-500">.</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Illusion is India’s premier luxury hotel reservation and curated holiday booking platform. Discover iconic
              palaces, beachfront private villas, and high-altitude sanctuaries with transparent pricing and real-time inventory.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-white mb-2">Subscribe for secret member-only deals:</p>
              {subscribed ? (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>You are subscribed to exclusive Illusion luxury offers!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Join</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Explore</h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/hotels" className="hover:text-white transition-colors">
                  Hotels & Resorts
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-white transition-colors">
                  Curated Tour Packages
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Chauffeured Cabs & Transfers
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition-colors">
                  Promos & Discount Coupons
                </Link>
              </li>
              <li>
                <Link to="/my-trips" className="hover:text-white transition-colors">
                  My Trips & Reservations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Top Destinations</h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/hotels?city=Goa" className="hover:text-white transition-colors">
                  Goa Beach Resorts
                </Link>
              </li>
              <li>
                <Link to="/hotels?city=Jaipur" className="hover:text-white transition-colors">
                  Jaipur Heritage Haveli
                </Link>
              </li>
              <li>
                <Link to="/hotels?city=Manali" className="hover:text-white transition-colors">
                  Manali Snow Chalets
                </Link>
              </li>
              <li>
                <Link to="/hotels?city=Kerala" className="hover:text-white transition-colors">
                  Kerala Backwater Villas
                </Link>
              </li>
              <li>
                <Link to="/hotels?city=Udaipur" className="hover:text-white transition-colors">
                  Udaipur Lake Palaces
                </Link>
              </li>
              <li>
                <Link to="/hotels?city=Mumbai" className="hover:text-white transition-colors">
                  Mumbai Waterfront Stays
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Support & Trust</h5>
            <ul className="space-y-2.5 text-xs">
              <li className="text-slate-300 font-semibold">Toll-Free Concierge:</li>
              <li className="text-orange-400 font-bold text-sm">+91 1800-456-7890</li>
              <li className="text-slate-400 pt-1">support@illusiontravel.com</li>
              <li className="pt-2">
                <Link to="/admin" className="text-sky-400 hover:text-sky-300 font-medium">
                  Portal Login (/admin)
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-slate-500">Available 24 hours a day, 365 days a year</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 Illusion Travel Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Secure 256-Bit SSL Booking</span>
            <span>•</span>
            <span>Accepted Payments: UPI, Cards, NetBanking</span>
            <span>•</span>
            <span>PCI-DSS Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
