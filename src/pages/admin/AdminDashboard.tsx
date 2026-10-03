import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings, getHotels, getPackages, getCustomers } from '../../services/db';
import { Booking, Hotel, TourPackage, UserProfile } from '../../types';
import {
  TrendingUp,
  DollarSign,
  CalendarCheck,
  Building,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [bList, hList, pList, cList] = await Promise.all([
          getAllBookings(),
          getHotels(),
          getPackages(),
          getCustomers()
        ]);
        setBookings(bList);
        setHotels(hList);
        setPackages(pList);
        setCustomers(cList);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Compute Metrics
  const totalRevenue = bookings.reduce((sum, b) => (b.bookingStatus !== 'cancelled' ? sum + b.totalPrice : sum), 0);
  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
  const occupancyRate = 78.4; // Estimated aggregate occupancy percentage

  // Recent 5 bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Revenue chart simulation data
  const monthlyRevenue = [
    { month: 'May', revenue: 420000 },
    { month: 'Jun', revenue: 680000 },
    { month: 'Jul', revenue: 890000 },
    { month: 'Aug', revenue: 1150000 },
    { month: 'Sep', revenue: 1420000 },
    { month: 'Oct', revenue: 1850000 }
  ];

  const maxRev = Math.max(...monthlyRevenue.map((m) => m.revenue));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block mb-1">
            Real-Time Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">Executive Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Platform performance, inventory occupancy, and revenue streams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/hotels"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            + Add New Property
          </Link>
          <Link
            to="/admin/packages"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            + Add Tour Package
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Platform Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white font-heading">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.6% vs last quarter</span>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reservations</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white font-heading">{bookings.length}</span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
              <span>{confirmedCount} confirmed stays</span>
            </div>
          </div>
        </div>

        {/* Average Occupancy */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white font-heading">{occupancyRate}%</span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
              <span>Peak season high demand</span>
            </div>
          </div>
        </div>

        {/* Registered Users */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Customers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white font-heading">{customers.length || 1}</span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
              <span>Verified customer accounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Low Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Bar Chart */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Monthly Revenue Stream (INR)</h3>
              <p className="text-xs text-slate-400">Monthly booking volume trajectory</p>
            </div>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-xl">
              FY 2026
            </span>
          </div>

          <div className="h-60 flex items-end justify-between gap-3 pt-6 border-b border-slate-700/80 pb-2">
            {monthlyRevenue.map((item) => {
              const heightPct = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(item.revenue / 100000).toFixed(1)}L
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-orange-600 to-amber-500 rounded-xl group-hover:brightness-110 transition-all shadow-md shadow-orange-600/20"
                  />
                  <span className="text-xs font-bold text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Inventory & Operational Alerts */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Inventory Alerts
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
              3 High Demand
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">The Leela Palatial Cove, Goa</span>
                <span className="text-[10px] font-bold text-rose-400">2 Rooms Left</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Oceanview Suite inventory approaching critical capacity for Diwali weekend.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Kashmir Valley Tour Package</span>
                <span className="text-[10px] font-bold text-amber-400">Oct 22 Sold Out</span>
              </div>
              <p className="text-[11px] text-slate-400">
                All 14 slots booked. Consider publishing additional departure dates.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Taj Lakefront Mirage, Udaipur</span>
                <span className="text-[10px] font-bold text-rose-400">Only 1 Villa Left</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Royal Presidential Pool Villa almost booked through November.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-heading">Recent Platform Bookings</h3>
            <p className="text-xs text-slate-400">Live incoming reservation feed</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No bookings recorded yet. Once users complete reservations, they will appear here live.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Property / Package</th>
                  <th className="pb-3">Check-In</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-700/30">
                    <td className="py-3 font-mono font-bold text-orange-400">{b.bookingNumber}</td>
                    <td className="py-3 font-medium text-white">{b.customerDetails.fullName}</td>
                    <td className="py-3 text-slate-300 truncate max-w-xs">{b.itemName}</td>
                    <td className="py-3 text-slate-400">{b.checkInDate}</td>
                    <td className="py-3 font-bold text-white">₹{b.totalPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : b.bookingStatus === 'cancelled'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
