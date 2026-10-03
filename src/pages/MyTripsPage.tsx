import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserBookings, cancelBooking } from '../services/db';
import { Booking } from '../types';
import { BookingVoucher } from '../components/booking/BookingVoucher';
import { ReviewModal } from '../components/modals/ReviewModal';
import {
  Luggage,
  Calendar,
  MapPin,
  Printer,
  XCircle,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const MyTripsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Modals state
  const [selectedVoucher, setSelectedVoucher] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of travel plans');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserBookings(user.uid);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const now = new Date();

  // Categorize bookings
  const categorized = bookings.filter((b) => {
    if (b.bookingStatus === 'cancelled') {
      return activeTab === 'cancelled';
    }
    const checkIn = new Date(b.checkInDate);
    if (checkIn < now) {
      return activeTab === 'completed';
    }
    return activeTab === 'upcoming';
  });

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      const res = await cancelBooking(cancelModalBooking.id, cancelReason);
      if (res.success) {
        showToast(res.message, 'success');
        setCancelModalBooking(null);
        await fetchBookings();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Luggage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Please Sign In</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Sign in to view your upcoming itineraries, vouchers, and past travel memories.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors inline-block"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              <Luggage className="w-4 h-4" />
              <span>Itinerary Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              My Trips & Reservations
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your upcoming stays, access printable official vouchers, or submit verified reviews.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-sky-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-sky-950'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-3xl" />
            ))}
          </div>
        ) : categorized.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <Luggage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No {activeTab} trips found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming reservations. Ready for your next luxury holiday?"
                : `No ${activeTab} reservations found.`}
            </p>
            <Link
              to="/hotels"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors inline-block"
            >
              Explore Hotels & Packages
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {categorized.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  {booking.itemDetails?.photo && (
                    <img
                      src={booking.itemDetails.photo}
                      alt=""
                      className="w-24 h-24 object-cover rounded-2xl shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-sky-950 bg-slate-100 px-2 py-0.5 rounded">
                        {booking.bookingNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          booking.bookingStatus === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : booking.bookingStatus === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-heading">{booking.itemName}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-800" />
                        Check-in: {booking.checkInDate}
                      </span>
                      {booking.checkOutDate && (
                        <span>• Check-out: {booking.checkOutDate}</span>
                      )}
                      <span>• {booking.guestsCount} Guests</span>
                    </div>

                    {booking.itemDetails?.roomName && (
                      <p className="text-xs text-slate-600 font-medium">Room: {booking.itemDetails.roomName}</p>
                    )}

                    {booking.cancellationDetails && (
                      <p className="text-xs text-rose-600 font-semibold pt-1">
                        Cancelled on {new Date(booking.cancellationDetails.cancelledAt).toLocaleDateString()}. Refund: ₹{booking.cancellationDetails.refundAmount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions & Amount */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Total Paid</span>
                    <span className="text-lg font-black text-sky-950 font-heading">
                      ₹{booking.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVoucher(booking)}
                      className="px-3.5 py-1.5 bg-sky-950 hover:bg-sky-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-orange-400" />
                      <span>Voucher</span>
                    </button>

                    {activeTab === 'upcoming' && booking.bookingStatus === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => setCancelModalBooking(booking)}
                        className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {activeTab === 'completed' && (
                      <button
                        type="button"
                        onClick={() => setReviewBooking(booking)}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Rate Stay</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Voucher Modal */}
      {selectedVoucher && (
        <BookingVoucher booking={selectedVoucher} onClose={() => setSelectedVoucher(null)} />
      )}

      {/* Review Modal for Completed Stays */}
      {reviewBooking && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewBooking(null)}
          bookingId={reviewBooking.id}
          targetId={reviewBooking.itemId}
          targetType={reviewBooking.type === 'package' ? 'package' : 'hotel'}
          targetName={reviewBooking.itemName}
          onSubmitted={() => {
            setReviewBooking(null);
            showToast('Review submitted successfully!', 'success');
          }}
        />
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Cancel Reservation</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel your reservation for{' '}
              <strong className="text-slate-900">{cancelModalBooking.itemName}</strong>?
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700">Cancellation Policy:</span>
              <p className="text-slate-500">
                • 100% refund if cancelled 48+ hours prior to check-in.
                <br />• 50% refund if cancelled between 24-48 hours.
                <br />• Non-refundable within 24 hours of arrival.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option>Change of travel plans</option>
                <option>Found alternative hotel</option>
                <option>Emergency or medical reason</option>
                <option>Booked by mistake</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
