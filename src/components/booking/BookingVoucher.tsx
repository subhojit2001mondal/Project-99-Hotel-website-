import React from 'react';
import { Booking } from '../../types';
import { Compass, Printer, X, CheckCircle2, MapPin, Calendar, Users, ShieldCheck } from 'lucide-react';

interface BookingVoucherProps {
  booking: Booking;
  onClose?: () => void;
}

export const BookingVoucher: React.FC<BookingVoucherProps> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto no-print">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 printable-voucher">
        {/* Action Header bar (hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Official Booking Voucher
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-8 space-y-6">
          {/* Top Brand & Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-950 flex items-center justify-center text-white">
                <Compass className="w-7 h-7 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-sky-950 font-heading">
                  Illusion<span className="text-orange-600">.</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">Verified Reservation Confirmation Voucher</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {booking.bookingStatus === 'confirmed' ? '✓ CONFIRMED BOOKING' : booking.bookingStatus.toUpperCase()}
              </span>
              <p className="text-xs text-slate-500 font-mono mt-1 font-semibold">
                ID: <span className="text-sky-950">{booking.bookingNumber || booking.id}</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Booked on: {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Reserved Item Summary */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  {booking.type.toUpperCase()} RESERVATION
                </span>
                <h3 className="text-lg font-bold text-slate-900">{booking.itemName}</h3>
              </div>
              {booking.itemDetails?.city && (
                <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>{booking.itemDetails.city}</span>
                </div>
              )}
            </div>

            {booking.itemDetails?.address && (
              <p className="text-xs text-slate-500 mb-4">{booking.itemDetails.address}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Check-in Date</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-800" />
                  {booking.checkInDate}
                </span>
              </div>
              {booking.checkOutDate && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Check-out Date</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-800" />
                    {booking.checkOutDate}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block text-[11px]">Guests & Rooms</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-sky-800" />
                  {booking.guestsCount} Guest(s) {booking.roomCount ? `• ${booking.roomCount} Room(s)` : ''}
                </span>
              </div>
              {booking.itemDetails?.roomName && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Category</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">{booking.itemDetails.roomName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guest Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-100 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lead Traveler</h4>
              <p className="text-sm font-bold text-slate-800">{booking.customerDetails.fullName}</p>
              <p className="text-xs text-slate-500 mt-1">{booking.customerDetails.email}</p>
              <p className="text-xs text-slate-500">{booking.customerDetails.phoneNumber}</p>
              {booking.customerDetails.idType && (
                <p className="text-[11px] text-slate-400 mt-1">
                  ID: {booking.customerDetails.idType} ({booking.customerDetails.idNumber || 'Verified at check-in'})
                </p>
              )}
            </div>

            <div className="border border-slate-100 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Breakdown</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Amount:</span>
                  <span>₹{booking.basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes & GST (12%):</span>
                  <span>₹{booking.taxes.toLocaleString('en-IN')}</span>
                </div>
                {booking.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount {booking.couponCode ? `(${booking.couponCode})` : ''}:</span>
                    <span>-₹{booking.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-sky-950 pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span>₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-1">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : booking.paymentMethod === 'pay_at_hotel'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    Payment: {booking.paymentMethod === 'pay_at_hotel' ? 'Pay at Property' : 'Paid Online (Verified)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Policy and Guidelines */}
          <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-100 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-sky-950">
              <ShieldCheck className="w-4 h-4 text-sky-800" />
              <span>Important Check-in & Cancellation Guidelines</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              • Free cancellation is allowed up to 48 hours prior to check-in for full refund.
              <br />• A government-issued photo ID is required for all adult guests at the time of check-in.
              <br />• For any assistance or itinerary modification, contact Illusion 24/7 Concierge at +91 1800-456-7890.
            </p>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            Thank you for choosing Illusion. Have a memorable, safe journey!
          </div>
        </div>
      </div>
    </div>
  );
};
