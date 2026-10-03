import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPackageById, getReviewsForTarget } from '../services/db';
import { TourPackage, Review } from '../types';
import { useToast } from '../context/ToastContext';
import {
  Palmtree,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Star,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ChevronRight,
  Phone,
  Clock,
  ArrowRight,
  Utensils
} from 'lucide-react';

export const PackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking widget state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getPackageById(id);
        if (data) {
          setPkg(data);
          if (data.departureDates && data.departureDates.length > 0) {
            setSelectedDate(data.departureDates[0]);
          }
        }
        const revs = await getReviewsForTarget(id);
        setReviews(revs);
      } catch (err) {
        console.error('Error loading package:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="w-1/3 h-8 bg-slate-200 rounded-xl" />
        <div className="w-full h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Package Not Found</h2>
        <Link to="/packages" className="mt-4 px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold inline-block">
          Explore Packages
        </Link>
      </div>
    );
  }

  const subtotal = pkg.pricePerPerson * travelersCount;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  const handleBookNow = () => {
    if (!selectedDate) {
      showToast('Please pick a departure date.', 'error');
      return;
    }
    const params = new URLSearchParams({
      type: 'package',
      itemId: pkg.id,
      itemName: pkg.title,
      departureDate: selectedDate,
      guests: travelersCount.toString(),
      rate: pkg.pricePerPerson.toString()
    });
    navigate(`/book?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-sky-950">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to="/packages" className="hover:text-sky-950">
            Tour Packages
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-semibold truncate max-w-[200px]">{pkg.title}</span>
        </div>

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-950 text-white">
                {pkg.destination}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                {pkg.durationDays} Days / {pkg.durationNights} Nights
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">{pkg.title}</h1>
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex flex-col items-center justify-center font-bold">
              <span className="text-base font-heading">{pkg.rating}</span>
              <span className="text-[9px] uppercase font-bold">/ 5.0</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Operator Rating</span>
              <span className="text-[11px] text-slate-400">Based on {pkg.reviewsCount || 85} travelers</span>
            </div>
          </div>
        </div>

        {/* High-res Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-3xl overflow-hidden h-72 md:h-96">
          <div className="md:col-span-2 h-full overflow-hidden">
            <img src={pkg.photos[0]} alt={pkg.title} className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:flex flex-col gap-3 h-full">
            {pkg.photos.slice(1, 3).map((p, idx) => (
              <img key={idx} src={p} alt="" className="w-full h-1/2 object-cover rounded-xl" />
            ))}
          </div>
        </div>

        {/* Main Content & Sticky Booking Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* Overview & Highlights */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-heading">Trip Overview</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{pkg.description}</p>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Itinerary Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {pkg.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Day-Wise Detailed Itinerary */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">
                    Day-By-Day Plan
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 font-heading">Detailed Day-Wise Itinerary</h2>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {pkg.itinerary.map((day) => {
                  const isExpanded = expandedDay === day.day;
                  return (
                    <div
                      key={day.day}
                      className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                        className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-sky-950 text-white text-xs font-black flex items-center justify-center font-heading shrink-0">
                            D{day.day}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 font-heading block">{day.title}</span>
                            {day.mealsIncluded && day.mealsIncluded.length > 0 && (
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Utensils className="w-3 h-3 text-orange-600" />
                                Meals: {day.mealsIncluded.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-600 space-y-3">
                          <p className="leading-relaxed">{day.description}</p>
                          {day.activities && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {day.activities.map((act, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[10px] font-semibold">
                                  ✓ {act}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What’s Included
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  {pkg.inclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  What’s Excluded
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  {pkg.exclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold shrink-0">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tour Agent Profile Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-950 text-white font-bold flex items-center justify-center font-heading text-lg">
                  {pkg.agentName ? pkg.agentName.charAt(0) : 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900">{pkg.agentName || 'Verified Illusion Tour Operator'}</h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-400">Verified & Licensed Tour Operator on Illusion</p>
                </div>
              </div>

              {pkg.agentPhone && (
                <div className="text-right text-xs">
                  <span className="text-slate-400 block">Direct Concierge</span>
                  <span className="font-bold text-sky-950 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-orange-600" />
                    {pkg.agentPhone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Booking Widget */}
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-sky-950/10 shadow-xl space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fixed Departure Fare</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-sky-950 font-heading">
                    ₹{pkg.pricePerPerson.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500">/ person</span>
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  ✓ Covers stays, transfers, breakfast & sightseeing
                </p>
              </div>

              {/* Departure Date Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Available Departure Date</label>
                <div className="grid grid-cols-2 gap-2">
                  {pkg.departureDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        selectedDate === date
                          ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 mx-auto mb-1 opacity-70" />
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Travelers */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Travelers Count</label>
                <select
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} Traveler{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fare Calculation */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>₹{pkg.pricePerPerson.toLocaleString('en-IN')} × {travelersCount} Travelers</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & GST (12%)</span>
                  <span>₹{taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-900">
                  <span className="text-sm">Total Package Fare</span>
                  <span className="text-xl font-heading text-sky-950">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookNow}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <span>Book This Package</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-slate-400">
                100% verified operator & instant booking confirmation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
