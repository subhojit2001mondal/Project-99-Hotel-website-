import React, { useState, useEffect } from 'react';
import { getAllBookings, updateBookingStatus } from '../../services/db';
import { Booking } from '../../types';
import { useToast } from '../../context/ToastContext';
import { BookingVoucher } from '../../components/booking/BookingVoucher';
import {
  CalendarCheck,
  Search,
  Printer,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Eye,
  X
} from 'lucide-react';

export const AdminBookings: React.FC = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVoucher, setSelectedVoucher] = useState<Booking | null>(null);

  // Status edit modal
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<Booking['bookingStatus']>('confirmed');
  const [newPaymentStatus, setNewPaymentStatus] = useState<Booking['paymentStatus']>('paid');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async () => {
    if (!editingBooking) return;
    try {
      await updateBookingStatus(editingBooking.id, newStatus, newPaymentStatus);
      showToast(`Booking ${editingBooking.bookingNumber} updated`, 'success');
      setEditingBooking(null);
      await fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.bookingStatus !== statusFilter) {
      return false;
    }
    const query = search.toLowerCase();
    return (
      b.bookingNumber?.toLowerCase().includes(query) ||
      b.customerDetails?.fullName?.toLowerCase().includes(query) ||
      b.itemName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-heading">Bookings & Reservations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time guest reservations, update check-in fulfillment, and process refunds.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Booking ID, Guest name, or Hotel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Reference ID</th>
                <th className="p-4">Guest Details</th>
                <th className="p-4">Reserved Item</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-700/30">
                  <td className="p-4 font-mono font-bold text-orange-400">{b.bookingNumber}</td>
                  <td className="p-4">
                    <span className="font-bold text-white block">{b.customerDetails?.fullName}</span>
                    <span className="text-[11px] text-slate-400">{b.customerDetails?.email}</span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="font-semibold block truncate max-w-xs">{b.itemName}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{b.type}</span>
                  </td>
                  <td className="p-4 text-slate-400">{b.checkInDate}</td>
                  <td className="p-4 font-bold text-white">₹{b.totalPrice.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.paymentStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : b.paymentStatus === 'refunded'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.bookingStatus === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : b.bookingStatus === 'cancelled'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedVoucher(b)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                      title="View Voucher"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBooking(b);
                        setNewStatus(b.bookingStatus);
                        setNewPaymentStatus(b.paymentStatus);
                      }}
                      className="p-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                      title="Update Status"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-800 rounded-3xl p-6 space-y-4 border border-slate-700 text-xs text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-bold text-sm">Update Reservation Status</h3>
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block mb-1">Booking Reference:</span>
                <span className="font-mono font-bold text-orange-400">{editingBooking.bookingNumber}</span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Reservation Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                >
                  <option value="paid">Paid</option>
                  <option value="pay_at_hotel">Pay at Hotel</option>
                  <option value="refunded">Refunded (Mark refund issued)</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Lightbox */}
      {selectedVoucher && (
        <BookingVoucher booking={selectedVoucher} onClose={() => setSelectedVoucher(null)} />
      )}
    </div>
  );
};
