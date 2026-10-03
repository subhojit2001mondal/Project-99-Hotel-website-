import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Building2,
  Palmtree,
  Car,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Copy,
  Tag,
  ShieldCheck,
  Award,
  ChevronRight,
  TrendingUp,
  Heart
} from 'lucide-react';
import { getHotels, getPackages, getBanners, getCoupons, toggleWishlist, getWishlist } from '../services/db';
import { Hotel, TourPackage, Banner, Coupon, WishlistItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'hotels' | 'packages' | 'services'>('hotels');

  // Search state
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  // Package search state
  const [packageDestination, setPackageDestination] = useState('');

  // Service search state
  const [serviceCity, setServiceCity] = useState('');
  const [serviceType, setServiceType] = useState<'cab' | 'activity' | 'transfer'>('transfer');

  // Catalog state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set default check-in to tomorrow, check-out to day after tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);

    setCheckIn(tomorrow.toISOString().split('T')[0]);
    setCheckOut(dayAfter.toISOString().split('T')[0]);

    const fetchData = async () => {
      try {
        const [hList, pList, bList, cList] = await Promise.all([
          getHotels(),
          getPackages(),
          getBanners(),
          getCoupons()
        ]);
        setHotels(hList);
        setPackages(pList);
        setBanners(bList);
        setCoupons(cList);

        if (user) {
          const wList = await getWishlist(user.uid);
          setWishlistIds(wList.map((item) => item.itemId));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleHotelSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests.toString());
    if (rooms) params.set('rooms', rooms.toString());
    navigate(`/hotels?${params.toString()}`);
  };

  const handlePackageSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (packageDestination) params.set('destination', packageDestination);
    navigate(`/packages?${params.toString()}`);
  };

  const handleServiceSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (serviceCity) params.set('city', serviceCity);
    if (serviceType) params.set('type', serviceType);
    navigate(`/services?${params.toString()}`);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code "${code}" copied! Apply at checkout.`, 'success');
  };

  const handleToggleWishlist = async (hotel: Hotel) => {
    if (!user) {
      showToast('Please sign in to save stays to your wishlist.', 'info');
      return;
    }
    try {
      const added = await toggleWishlist(user.uid, {
        itemId: hotel.id,
        itemType: 'hotel',
        itemTitle: hotel.name,
        itemCity: hotel.city,
        itemPrice: hotel.basePrice,
        itemPhoto: hotel.photos[0] || '',
        itemRating: hotel.averageRating || hotel.starRating
      });
      if (added) {
        setWishlistIds((prev) => [...prev, hotel.id]);
        showToast(`Saved ${hotel.name} to your Wishlist!`, 'success');
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== hotel.id));
        showToast(`Removed from Wishlist`, 'info');
      }
    } catch {
      showToast('Could not update wishlist', 'error');
    }
  };

  const trendingDestinations = [
    { name: 'Goa', tag: 'Beach Stays & Nightlife', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', count: '14+ Stays' },
    { name: 'Jaipur', tag: 'Royal Forts & Haveli', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=80', count: '18+ Stays' },
    { name: 'Manali', tag: 'Snow Peaks & Chalets', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80', count: '9+ Stays' },
    { name: 'Kerala', tag: 'Backwaters & Ayurvedic Spas', image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=600&q=80', count: '12+ Stays' },
    { name: 'Udaipur', tag: 'Romantic Lake Palaces', image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=600&q=80', count: '11+ Stays' },
    { name: 'Mumbai', tag: 'Oceanfront Luxury', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80', count: '22+ Stays' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-sky-950 via-slate-900 to-sky-900 text-white pt-10 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Hero Headlines */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-orange-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Experience India’s Most Exclusive Stays & Escapes</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-tight">
              Where Luxury Meets <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                Unforgettable Journeys
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Book handpicked five-star palaces, beachfront pool villas, and bespoke curated tour packages with guaranteed instant vouchers.
            </p>
          </div>

          {/* Unified MakeMyTrip / BookMyShow Style Search Box */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-950/40 p-4 sm:p-6 text-slate-800 border border-slate-100 max-w-5xl mx-auto">
            {/* Search Tabs */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 border-b border-slate-100 pb-4 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('hotels')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'hotels'
                    ? 'bg-sky-950 text-white shadow-md shadow-sky-950/20'
                    : 'text-slate-600 hover:text-sky-950 hover:bg-slate-100'
                }`}
              >
                <Building2 className={`w-4 h-4 ${activeTab === 'hotels' ? 'text-orange-400' : ''}`} />
                <span>Hotels & Resorts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('packages')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'packages'
                    ? 'bg-sky-950 text-white shadow-md shadow-sky-950/20'
                    : 'text-slate-600 hover:text-sky-950 hover:bg-slate-100'
                }`}
              >
                <Palmtree className={`w-4 h-4 ${activeTab === 'packages' ? 'text-orange-400' : ''}`} />
                <span>Tour Packages</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'services'
                    ? 'bg-sky-950 text-white shadow-md shadow-sky-950/20'
                    : 'text-slate-600 hover:text-sky-950 hover:bg-slate-100'
                }`}
              >
                <Car className={`w-4 h-4 ${activeTab === 'services' ? 'text-orange-400' : ''}`} />
                <span>Cabs & Transfers</span>
              </button>
            </div>

            {/* TAB 1: HOTELS SEARCH FORM */}
            {activeTab === 'hotels' && (
              <form onSubmit={handleHotelSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Destination */}
                  <div className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-colors focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-600" />
                      City / Destination
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Goa, Jaipur, Manali"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Check-In */}
                  <div className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-colors focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-800" />
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Check-Out */}
                  <div className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-colors focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-800" />
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Rooms & Guests */}
                  <div className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-colors">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3 text-sky-800" />
                      Rooms & Guests
                    </label>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 pt-0.5">
                      <div className="flex items-center gap-2">
                        <select
                          value={rooms}
                          onChange={(e) => setRooms(Number(e.target.value))}
                          className="bg-transparent font-bold focus:outline-none cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                        <span>•</span>
                        <select
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="bg-transparent font-bold focus:outline-none cursor-pointer"
                        >
                          {[1, 2, 3, 4, 6, 8, 10].map((n) => (
                            <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Free cancellation available on selected rooms</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 ml-auto"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Luxury Stays</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: PACKAGES SEARCH FORM */}
            {activeTab === 'packages' && (
              <form onSubmit={handlePackageSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Palmtree className="w-3 h-3 text-orange-600" />
                      Destination or Holiday Theme
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kashmir, Rajasthan, Kerala, Bali"
                      value={packageDestination}
                      onChange={(e) => setPackageDestination(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Travel Month
                    </label>
                    <select className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none">
                      <option>Any Departure Month</option>
                      <option>October 2026</option>
                      <option>November 2026</option>
                      <option>December 2026</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Search className="w-4 h-4" />
                    <span>Explore Tour Packages</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: SERVICES SEARCH FORM */}
            {activeTab === 'services' && (
              <form onSubmit={handleServiceSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-600" />
                      Service City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Goa, Jaipur, Mumbai"
                      value={serviceCity}
                      onChange={(e) => setServiceCity(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Service Type
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as any)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="transfer">Airport Sedan / SUV Transfer</option>
                      <option value="cab">Chauffeured City Sightseeing Cab</option>
                      <option value="activity">Tours, Cruise & Adventure Activities</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Services</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Offers & Promo Coupons Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between gap-3 hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600">
                    {coupon.discountType === 'flat' ? `FLAT ₹${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`}
                  </span>
                  <p className="font-mono text-xs font-bold text-slate-900 tracking-wider">{coupon.code}</p>
                  <p className="text-[10px] text-slate-400">Min booking ₹{coupon.minAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCoupon(coupon.code)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 transition-colors"
                title="Copy Coupon"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Inspiration For Your Next Escape</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Trending Destinations
            </h2>
          </div>
          <Link
            to="/hotels"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
          >
            <span>View All Hubs</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingDestinations.map((dest) => (
            <Link
              key={dest.name}
              to={`/hotels?city=${encodeURIComponent(dest.name)}`}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 aspect-[3/4] flex flex-col justify-end p-4 text-white"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="relative z-10">
                <span className="text-[10px] font-bold text-orange-400 block tracking-wide">{dest.count}</span>
                <h3 className="text-base font-bold font-heading">{dest.name}</h3>
                <p className="text-[10px] text-slate-300 truncate">{dest.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="bg-white py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1 block">
                Direct Hotel Partnerships
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                Signature Hotels & Luxury Resorts
              </h2>
            </div>
            <Link
              to="/hotels"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <span>Explore All {hotels.length} Stays</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.slice(0, 6).map((hotel) => {
              const isWishlisted = wishlistIds.includes(hotel.id);
              return (
                <div
                  key={hotel.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  {/* Photo container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={hotel.photos[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-950/80 backdrop-blur-md text-white">
                        {hotel.propertyType}
                      </span>
                      {hotel.featured && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleWishlist(hotel)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                        isWishlisted
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-950/40 text-white hover:bg-slate-950/60'
                      }`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-slate-900 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{hotel.averageRating || hotel.starRating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({hotel.reviewsCount || 42})</span>
                    </div>
                  </div>

                  {/* Hotel details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span className="truncate">{hotel.address}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 font-heading line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {hotel.description}
                      </p>

                      {/* Amenities pills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {hotel.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600"
                          >
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                            +{hotel.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Starts from</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-sky-950 font-heading">
                            ₹{hotel.basePrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-500 font-normal">/ night</span>
                        </div>
                      </div>

                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="px-4 py-2 bg-sky-950 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        View Rooms
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Curated Tour Packages Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1 block">
              Handcrafted Itineraries
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Popular Holiday Tour Packages
            </h2>
          </div>
          <Link
            to="/packages"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            <span>View All Tour Packages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.slice(0, 4).map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={pkg.photos[0]}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-sky-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider">
                  {pkg.durationDays}D / {pkg.durationNights}N
                </div>
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px] font-bold text-slate-900">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{pkg.rating}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                    {pkg.destination}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 font-heading line-clamp-2 mt-0.5 group-hover:text-orange-600 transition-colors">
                    {pkg.title}
                  </h3>

                  <ul className="mt-3 space-y-1">
                    {pkg.highlights.slice(0, 2).map((h, i) => (
                      <li key={i} className="text-[11px] text-slate-500 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">All-inclusive</span>
                    <span className="text-base font-black text-sky-950 font-heading">
                      ₹{pkg.pricePerPerson.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-1">per traveler</span>
                  </div>

                  <Link
                    to={`/packages/${pkg.id}`}
                    className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    View Plan
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Illusion Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2 block">
              The Illusion Distinction
            </span>
            <h2 className="text-3xl font-extrabold font-heading">
              Why Discerning Travelers Choose Illusion
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every property and tour on Illusion undergoes strict multi-point physical checks for cleanliness, safety, and uncompromising luxury.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-heading">Zero Double-Booking Guarantee</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our atomic Firestore inventory locks reserve rooms in real time across our property database. What you see is guaranteed to be reserved.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-heading">Transparent Pricing & Discounts</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Zero hidden booking surcharges. See your exact tax breakdowns, discounts, and apply coupons directly before choosing to pay online or at the hotel.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-heading">Instant Official Printable Voucher</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Immediately generate professional PDF-ready check-in vouchers with reference numbers, check-in instructions, and 24/7 concierge contact.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
