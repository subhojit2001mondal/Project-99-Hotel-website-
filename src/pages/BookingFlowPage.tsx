import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getHotelById,
  getPackageById,
  getCoupons,
  evaluateCouponDiscount,
  createBookingWithInventoryLock
} from '../services/db';
import { Hotel, HotelRoom, TourPackage, Coupon, Booking, PaymentMethod, PaymentStatus } from '../types';
import { BookingVoucher } from '../components/booking/BookingVoucher';
import { AuthModal } from '../components/auth/AuthModal';
import {
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  Building,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Tag,
  Lock,
  QrCode,
  Printer,
  AlertCircle
} from 'lucide-react';

export const BookingFlowPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, isVerified } = useAuth();
  const { showToast } = useToast();

  const type = (searchParams.get('type') as 'hotel' | 'package' | 'service') || 'hotel';
  const itemId = searchParams.get('itemId') || '';
  const roomId = searchParams.get('roomId') || '';
  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';
  const initialGuests = Number(searchParams.get('guests')) || 2;
  const initialRooms = Number(searchParams.get('rooms')) || 1;
  const initialRate = Number(searchParams.get('rate')) || 0;
  const departureDate = searchParams.get('departureDate') || '';

  // Steps: 1: Selection, 2: Guest Details, 3: Review & Price, 4: Payment, 5: Confirmation
  const [step, setStep] = useState<number>(1);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Loaded item data
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking config state
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestsCount, setGuestsCount] = useState(initialGuests);
  const [roomsCount, setRoomsCount] = useState(initialRooms);

  // Guest details state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [idType, setIdType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [onlineGatewayType, setOnlineGatewayType] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setGuestName(profile.fullName || '');
      setGuestEmail(profile.email || '');
      setGuestPhone(profile.phoneNumber || '');
    }
  }, [profile]);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        if (type === 'hotel') {
          const h = await getHotelById(itemId);
          if (h) {
            setHotel(h);
            const r = h.rooms?.find((rm) => rm.id === roomId) || h.rooms?.[0] || null;
            setSelectedRoom(r);
          }
        } else if (type === 'package') {
          const p = await getPackageById(itemId);
          if (p) setPkg(p);
        }
      } catch (err) {
        console.error('Error fetching booking item:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [type, itemId, roomId]);

  // Calculations
  const calculateFare = () => {
    let base = 0;
    let nights = 1;

    if (type === 'hotel') {
      const start = new Date(checkIn).getTime();
      const end = new Date(checkOut).getTime();
      nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24))) || 1;
      const rate = selectedRoom ? selectedRoom.pricePerNight : initialRate || hotel?.basePrice || 0;
      base = rate * nights * roomsCount;
    } else if (type === 'package') {
      const rate = pkg ? pkg.pricePerPerson : initialRate;
      base = rate * guestsCount;
    } else {
      base = initialRate;
    }

    const taxes = Math.round(base * 0.12);
    const total = Math.max(0, base + taxes - discountAmount);

    return { base, nights, taxes, total };
  };

  const { base, nights, taxes, total } = calculateFare();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponCode.trim()) return;

    try {
      const coupons = await getCoupons();
      const matched = coupons.find(
        (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase()
      );

      if (!matched) {
        setCouponError('Invalid coupon code. Try ILLUSION500 or FIRSTTRIP');
        return;
      }

      const evalRes = evaluateCouponDiscount(matched, base);
      if (!evalRes.valid) {
        setCouponError(evalRes.message);
        return;
      }

      setAppliedCoupon(matched);
      setDiscountAmount(evalRes.discount);
      showToast(evalRes.message, 'success');
    } catch {
      setCouponError('Failed to validate coupon.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const handleStep1Next = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      showToast('Please fill all guest contact details.', 'error');
      return;
    }
    setStep(3);
  };

  const handleStep3Next = () => {
    setStep(4);
  };

  const handleExecutePayment = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Simulate gateway authorization time
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const bookingNumber = `ILS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const bookingData: Omit<Booking, 'id' | 'createdAt'> = {
        bookingNumber,
        type,
        userId: user.uid,
        customerDetails: {
          fullName: guestName,
          email: guestEmail,
          phoneNumber: guestPhone,
          idType,
          idNumber,
          specialRequests
        },
        itemId,
        itemName: type === 'hotel' ? hotel?.name || 'Luxury Hotel' : pkg?.title || 'Tour Package',
        itemDetails: {
          city: type === 'hotel' ? hotel?.city : pkg?.destination,
          roomId: selectedRoom?.id,
          roomName: selectedRoom?.name,
          nights: type === 'hotel' ? nights : undefined,
          departureDate: type === 'package' ? departureDate : undefined,
          photo: type === 'hotel' ? hotel?.photos[0] : pkg?.photos[0],
          address: hotel?.address,
          cancellationPolicy: selectedRoom?.cancellationPolicy || hotel?.policies.cancellation
        },
        checkInDate: type === 'hotel' ? checkIn : departureDate,
        checkOutDate: type === 'hotel' ? checkOut : undefined,
        guestsCount,
        roomCount: type === 'hotel' ? roomsCount : undefined,
        totalPrice: total,
        basePrice: base,
        taxes,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'paid' : 'pay_at_hotel',
        bookingStatus: 'confirmed'
      };

      // Atomic write + inventory check to prevent double-booking
      const finalBooking = await createBookingWithInventoryLock(bookingData);

      setConfirmedBooking(finalBooking);
      setStep(5);

      // Launch celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast('Booking confirmed successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Selection' },
    { num: 2, title: 'Guest Info' },
    { num: 3, title: 'Fare & Coupons' },
    { num: 4, title: 'Payment' },
    { num: 5, title: 'Confirmed' }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded-xl w-1/3 mx-auto" />
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Indicator Header (BookMyShow Style) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
            {stepsList.map((s) => {
              const isPast = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-orange-600 text-white ring-4 ring-orange-100 shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      isCurrent ? 'text-sky-950 font-heading' : isPast ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: REVIEW SELECTION */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Step 1 of 5</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading mt-1">
                Review Your Reservation Choice
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row gap-4 items-start">
              <img
                src={type === 'hotel' ? hotel?.photos[0] : pkg?.photos[0]}
                alt=""
                className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0"
              />
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-950 bg-sky-100 px-2 py-0.5 rounded-md">
                  {type.toUpperCase()}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  {type === 'hotel' ? hotel?.name : pkg?.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>{type === 'hotel' ? hotel?.address : pkg?.destination}</span>
                </div>
                {selectedRoom && (
                  <p className="text-xs text-slate-700 font-semibold pt-1">
                    Room Category: <span className="text-sky-950">{selectedRoom.name}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Date and Guest Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {type === 'hotel' ? (
                <>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Number of Rooms
                    </label>
                    <select
                      value={roomsCount}
                      onChange={(e) => setRoomsCount(Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n} Room{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Total Guests
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 6, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} Guest{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Departure Date
                    </span>
                    <span className="text-sm font-bold text-slate-800">{departureDate}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Travelers
                    </span>
                    <span className="text-sm font-bold text-slate-800">{guestsCount} Traveler(s)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Estimated Total</span>
                <span className="text-xl font-black text-sky-950 font-heading">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleStep1Next}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Continue to Guest Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GUEST DETAILS */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Step 2 of 5</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading mt-1">
                  Primary Guest Information
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-sky-950 font-bold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            <form onSubmit={handleStep2Next} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (As on Govt ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Sahil Roy"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (For Voucher Delivery) *
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ID Document Type</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Quiet room, upper floor, late check-in notice, airport assistance..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">All guest information is encrypted and confidential.</span>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>Review Price Breakdown</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: PRICE BREAKDOWN & COUPONS */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Step 3 of 5</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading mt-1">
                  Itemized Fare & Promo Codes
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-sky-950 font-bold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            {/* Coupon Code Input */}
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/70">
              <label className="block text-xs font-bold text-orange-950 mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-orange-600" />
                <span>Have a Promo Coupon?</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-mono text-xs font-black text-emerald-800">{appliedCoupon.code}</span>
                      <p className="text-[10px] text-emerald-700">₹{discountAmount} deduction applied</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Try ILLUSION500, FIRSTTRIP"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && <p className="text-xs text-rose-600 mt-2">{couponError}</p>}
            </div>

            {/* Transparent Bill Breakdown */}
            <div className="border border-slate-100 rounded-2xl p-5 space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Base Fare:</span>
                <span className="font-semibold text-slate-800">₹{base.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Government Taxes & GST (12%):</span>
                <span className="font-semibold text-slate-800">₹{taxes.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Platform Booking Fee:</span>
                <span className="font-semibold">FREE (Special Promo)</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code}):</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-900">
                <span className="text-base font-heading">Total Payable</span>
                <span className="text-2xl font-heading text-sky-950">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Price Match Guaranteed</span>
              </div>
              <button
                type="button"
                onClick={handleStep3Next}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Proceed to Payment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT OPTIONS */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Step 4 of 5</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading mt-1">
                  Choose Payment Method
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs text-slate-500 hover:text-sky-950 font-bold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            {/* Payment Method Switch Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod('online')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-orange-500 bg-orange-50/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    <span>Pay Online (Instant Confirmation)</span>
                  </div>
                  {paymentMethod === 'online' && <CheckCircle2 className="w-5 h-5 text-orange-600" />}
                </div>
                <p className="text-xs text-slate-500">
                  UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking. Fast, encrypted checkout.
                </p>
                <span className="inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Recommended • Instant Voucher
                </span>
              </div>

              <div
                onClick={() => setPaymentMethod('pay_at_hotel')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'pay_at_hotel'
                    ? 'border-orange-500 bg-orange-50/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <Building className="w-5 h-5 text-sky-800" />
                    <span>Pay at Property / Pay Later</span>
                  </div>
                  {paymentMethod === 'pay_at_hotel' && <CheckCircle2 className="w-5 h-5 text-orange-600" />}
                </div>
                <p className="text-xs text-slate-500">
                  Book now with zero advance payment. Pay directly during check-in with cash or card.
                </p>
                <span className="inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Zero Advance Required
                </span>
              </div>
            </div>

            {/* Online Gateway Simulator */}
            {paymentMethod === 'online' && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    Payment Gateway (Demo / Test Simulation Mode)
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                    Pre-configured for Razorpay / Cards
                  </span>
                </div>

                <div className="flex gap-2">
                  {[
                    { id: 'upi', label: 'UPI / QR' },
                    { id: 'card', label: 'Credit / Debit Card' },
                    { id: 'netbanking', label: 'Net Banking' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setOnlineGatewayType(g.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        onlineGatewayType === g.id
                          ? 'bg-sky-950 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                {onlineGatewayType === 'upi' && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <QrCode className="w-10 h-10 text-sky-950" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Scan QR Code or enter UPI ID</span>
                        <p className="text-slate-400 text-[11px]">Instant UPI auto-approval simulator</p>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. mobile@upi or name@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                    />
                  </div>
                )}

                {onlineGatewayType === 'card' && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8892"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {onlineGatewayType === 'netbanking' && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs">
                    <label className="block font-bold text-slate-700 mb-2">Select Your Bank</label>
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none">
                      <option>HDFC Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Final Charge</span>
                <span className="text-2xl font-black text-sky-950 font-heading">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleExecutePayment}
                className="px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span>Securing Reservation...</span>
                ) : (
                  <>
                    <span>Confirm & Pay ₹{total.toLocaleString('en-IN')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION & VOUCHER */}
        {step === 5 && confirmedBooking && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
                Reservation Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
                Your Luxury Stay is All Set!
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                A confirmation email with your printable voucher has been sent to {confirmedBooking.customerDetails.email}.
              </p>
            </div>

            {/* Quick Summary Card */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs text-slate-500">Booking Reference</span>
                <span className="font-mono text-xs font-black text-sky-950">{confirmedBooking.bookingNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Property / Tour</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">{confirmedBooking.itemName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Check-in / Date</span>
                <span className="font-bold text-slate-800">{confirmedBooking.checkInDate}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-black text-sky-950 font-heading">
                  ₹{confirmedBooking.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Payment Status</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  {confirmedBooking.paymentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVoucherModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-sky-950 hover:bg-sky-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-orange-400" />
                <span>View & Print Official Voucher</span>
              </button>

              <Link
                to="/my-trips"
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors inline-block"
              >
                Go to My Trips
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Official Voucher Modal */}
      {voucherModalOpen && confirmedBooking && (
        <BookingVoucher booking={confirmedBooking} onClose={() => setVoucherModalOpen(false)} />
      )}

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </div>
  );
};
