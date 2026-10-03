import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHotelById, getReviewsForTarget, toggleWishlist, getWishlist } from '../services/db';
import { Hotel, HotelRoom, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  MapPin,
  Star,
  ShieldCheck,
  Heart,
  CheckCircle2,
  Calendar,
  Users,
  ChevronRight,
  Clock,
  Sparkles,
  Bed,
  Check,
  X,
  Share2,
  Maximize2
} from 'lucide-react';

export const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [selectedRoomCount, setSelectedRoomCount] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Booking widget dates
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);

  useEffect(() => {
    // Tomorrow and 3 days later defaults
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);

    setCheckInDate(tomorrow.toISOString().split('T')[0]);
    setCheckOutDate(dayAfter.toISOString().split('T')[0]);

    const fetchHotel = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getHotelById(id);
        if (data) {
          setHotel(data);
          if (data.rooms && data.rooms.length > 0) {
            setSelectedRoom(data.rooms[0]);
          }
        }
        const revs = await getReviewsForTarget(id);
        setReviews(revs);

        if (user) {
          const w = await getWishlist(user.uid);
          setIsWishlisted(w.some((item) => item.itemId === id));
        }
      } catch (err) {
        console.error('Error loading hotel:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id, user]);

  const nightsCount = Math.max(
    1,
    Math.round(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1
  );

  const nightlyRate = selectedRoom ? selectedRoom.pricePerNight : hotel?.basePrice || 0;
  const subtotal = nightlyRate * nightsCount * selectedRoomCount;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  const handleToggleWishlist = async () => {
    if (!hotel || !user) {
      showToast('Please sign in to save this property.', 'info');
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
      setIsWishlisted(added);
      showToast(added ? 'Saved to your Wishlist!' : 'Removed from Wishlist', added ? 'success' : 'info');
    } catch {
      showToast('Wishlist operation failed', 'error');
    }
  };

  const handleProceedToBooking = () => {
    if (!hotel || !selectedRoom) {
      showToast('Please choose a room category.', 'error');
      return;
    }
    const params = new URLSearchParams({
      type: 'hotel',
      itemId: hotel.id,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestsCount.toString(),
      rooms: selectedRoomCount.toString(),
      rate: selectedRoom.pricePerNight.toString()
    });
    navigate(`/book?${params.toString()}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hotel?.name,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Property link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="w-1/3 h-8 bg-slate-200 rounded-xl" />
        <div className="w-full h-96 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-64 bg-slate-200 rounded-3xl" />
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Property Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The requested luxury property may be unlisted or no longer available.
        </p>
        <Link
          to="/hotels"
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors inline-block"
        >
          Browse All Stays
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-sky-950">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link to="/hotels" className="hover:text-sky-950">
              Hotels
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold truncate max-w-[200px]">{hotel.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`p-2 bg-white rounded-xl border transition-colors ${
                isWishlisted
                  ? 'border-rose-300 text-rose-600 bg-rose-50'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Star Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-950 text-white">
                {hotel.propertyType}
              </span>
              <div className="flex items-center text-amber-500">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500">{hotel.starRating} Star Luxury</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">{hotel.name}</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <span>{hotel.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex flex-col items-center justify-center font-bold">
              <span className="text-base font-heading">{hotel.averageRating || hotel.starRating}</span>
              <span className="text-[9px] uppercase font-bold">/ 5.0</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Verified Guest Rating</span>
              <span className="text-[11px] text-slate-400">Based on {hotel.reviewsCount || 42} stays</span>
            </div>
          </div>
        </div>

        {/* High-Resolution Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden relative group">
          <div
            onClick={() => {
              setActivePhotoIndex(0);
              setGalleryModalOpen(true);
            }}
            className="md:col-span-2 h-72 md:h-96 relative cursor-pointer overflow-hidden"
          >
            <img
              src={hotel.photos[0]}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-slate-950/10 hover:bg-transparent transition-colors" />
          </div>

          <div className="hidden md:grid col-span-2 grid-cols-2 gap-3 h-96">
            {hotel.photos.slice(1, 5).map((photo, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActivePhotoIndex(idx + 1);
                  setGalleryModalOpen(true);
                }}
                className="relative cursor-pointer overflow-hidden rounded-xl"
              >
                <img
                  src={photo}
                  alt={`${hotel.name} ${idx + 2}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setGalleryModalOpen(true)}
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 shadow-lg flex items-center gap-1.5 hover:bg-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>View All Photos</span>
          </button>
        </div>

        {/* Two-Column Details and Sticky Price Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-heading">About This Luxury Property</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{hotel.description}</p>

              {/* Amenities Grid */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Signature Amenities & Facilities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hotel.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Categories Selector */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">
                  Choose Your Stay
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-heading">Available Room Categories</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Prices are per room per night. Real-time availability synchronized with hotel inventory.
                </p>
              </div>

              <div className="space-y-4">
                {hotel.rooms?.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <div
                      key={room.id}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col md:flex-row gap-5 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/20 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {room.photos && room.photos[0] && (
                        <img
                          src={room.photos[0]}
                          alt={room.name}
                          className="w-full md:w-48 h-36 object-cover rounded-xl shrink-0"
                        />
                      )}

                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-base font-bold text-slate-900 font-heading">{room.name}</h3>
                              <p className="text-xs text-slate-500 mt-0.5">{room.description}</p>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                              {room.cancellationPolicy}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-sky-800" />
                              Max {room.capacityGuests} Guests
                            </span>
                            <span className="flex items-center gap-1">
                              <Bed className="w-3.5 h-3.5 text-sky-800" />
                              {room.bedType}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Nightly Rate</span>
                            <span className="text-lg font-black text-sky-950 font-heading">
                              ₹{room.pricePerNight.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400"> + 12% GST</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedRoom(room)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isSelected ? '✓ Selected Room' : 'Select Room'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-heading">Property Policies & Guidelines</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-800" /> Check-in & Check-out
                  </span>
                  <p className="text-slate-600">
                    Check-in: {hotel.policies.checkIn} hrs <br />
                    Check-out: {hotel.policies.checkOut} hrs
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cancellation Terms
                  </span>
                  <p className="text-slate-600">{hotel.policies.cancellation}</p>
                </div>
              </div>
            </div>

            {/* Verified Reviews Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-heading">Guest Reviews & Ratings</h2>
                  <p className="text-xs text-slate-500">Verified feedback from guests who completed their stay.</p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No guest reviews yet. Be the first to share your experience after completing a reservation!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-sky-950 text-white text-[11px] font-bold flex items-center justify-center">
                            {rev.userName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                            <span className="text-[10px] text-slate-400 ml-2">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Price & Booking Card Column */}
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-sky-950/10 shadow-xl space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reservation Summary</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-sky-950 font-heading">
                    ₹{nightlyRate.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500">/ night</span>
                </div>
                {selectedRoom && (
                  <p className="text-xs text-orange-600 font-semibold mt-1">
                    Room: {selectedRoom.name}
                  </p>
                )}
              </div>

              {/* Date pickers */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Rooms
                    </label>
                    <select
                      value={selectedRoomCount}
                      onChange={(e) => setSelectedRoomCount(Number(e.target.value))}
                      className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n} Room{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Guests
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 6, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} Guest{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Calculation breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>
                    ₹{nightlyRate.toLocaleString('en-IN')} × {nightsCount} Night{nightsCount > 1 ? 's' : ''} × {selectedRoomCount} Room{selectedRoomCount > 1 ? 's' : ''}
                  </span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & GST (12%)</span>
                  <span>₹{taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Special Booking Perks</span>
                  <span>Free WiFi & Pool</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-900">
                  <span className="text-sm">Total Payable</span>
                  <span className="text-xl font-heading text-sky-950">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleProceedToBooking}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <span>Continue to Booking</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <p className="text-[11px] text-slate-400">No payment charged yet</p>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Free cancellation up to 48 hours prior</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Lightbox for Photos */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setGalleryModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-orange-400 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={hotel.photos[activePhotoIndex]}
              alt={hotel.name}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="flex justify-center gap-2 mt-4 overflow-x-auto py-2">
              {hotel.photos.map((p, idx) => (
                <img
                  key={idx}
                  src={p}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-16 h-12 object-cover rounded-lg cursor-pointer transition-all ${
                    activePhotoIndex === idx ? 'ring-2 ring-orange-500 scale-105' : 'opacity-60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
