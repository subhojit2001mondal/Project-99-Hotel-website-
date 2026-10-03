import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getHotels, toggleWishlist, getWishlist } from '../services/db';
import { Hotel, PropertyType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Star,
  Heart,
  Grid,
  Map as MapIcon,
  Check,
  RotateCcw,
  Sparkles,
  Building,
  ArrowRight
} from 'lucide-react';

export const HotelListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Search parameters from URL
  const queryCity = searchParams.get('city') || '';
  const queryGuests = Number(searchParams.get('guests')) || 2;
  const queryRooms = Number(searchParams.get('rooms')) || 1;
  const queryCheckIn = searchParams.get('checkIn') || '';
  const queryCheckOut = searchParams.get('checkOut') || '';

  // Filter States
  const [selectedCity, setSelectedCity] = useState(queryCity);
  const [maxPrice, setMaxPrice] = useState<number>(35000);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'rating'>('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchHotelsData = async () => {
      setLoading(true);
      try {
        const data = await getHotels();
        setHotels(data);
        if (user) {
          const w = await getWishlist(user.uid);
          setWishlistIds(w.map((item) => item.itemId));
        }
      } catch (err) {
        console.error('Failed to load hotels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotelsData();
  }, [user]);

  useEffect(() => {
    if (queryCity) {
      setSelectedCity(queryCity);
    }
  }, [queryCity]);

  // Unique amenities across loaded hotels
  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    hotels.forEach((h) => h.amenities.forEach((a) => set.add(a)));
    return Array.from(set);
  }, [hotels]);

  // Available cities
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    hotels.forEach((h) => set.add(h.city));
    return ['All Destinations', ...Array.from(set)];
  }, [hotels]);

  // Filter and Sort Logic
  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        // City filter
        if (selectedCity && selectedCity !== 'All Destinations' && hotel.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
        // Price filter
        if (hotel.basePrice > maxPrice) {
          return false;
        }
        // Star rating
        if (selectedStars.length > 0 && !selectedStars.includes(hotel.starRating)) {
          return false;
        }
        // Property type
        if (selectedTypes.length > 0 && !selectedTypes.includes(hotel.propertyType)) {
          return false;
        }
        // Amenities
        if (
          selectedAmenities.length > 0 &&
          !selectedAmenities.every((amenity) => hotel.amenities.includes(amenity))
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.basePrice - b.basePrice;
        if (sortBy === 'price_high') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return (b.averageRating || b.starRating) - (a.averageRating || a.starRating);
        return (b.reviewsCount || 0) - (a.reviewsCount || 0); // popular
      });
  }, [hotels, selectedCity, maxPrice, selectedStars, selectedTypes, selectedAmenities, sortBy]);

  const handleToggleStar = (star: number) => {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  };

  const handleToggleType = (type: PropertyType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleClearFilters = () => {
    setSelectedCity('');
    setMaxPrice(35000);
    setSelectedStars([]);
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setSortBy('popular');
    setSearchParams({});
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
        showToast(`Saved ${hotel.name} to wishlist!`, 'success');
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== hotel.id));
        showToast('Removed from wishlist', 'info');
      }
    } catch {
      showToast('Could not update wishlist', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Search summary bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 font-heading">
                {selectedCity && selectedCity !== 'All Destinations' ? `${selectedCity} Luxury Stays` : 'All Luxury Hotels & Resorts'}
              </h1>
              <p className="text-xs text-slate-500">
                {filteredHotels.length} verified propert{filteredHotels.length === 1 ? 'y' : 'ies'} available
                {queryCheckIn ? ` • Check-in: ${queryCheckIn}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* List / Map View Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list' ? 'bg-white text-sky-950 shadow-xs' : 'text-slate-500'
                }`}
                title="List View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map' ? 'bg-white text-sky-950 shadow-xs' : 'text-slate-500'
                }`}
                title="Map Cards"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden p-2 rounded-xl bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 ml-auto"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Filter Sidebar */}
          <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6`}>
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-600" />
                  Filter Stays
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>

              {/* Destination Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Destination</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-700">Max Nightly Price</span>
                  <span className="text-orange-600 font-heading">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="4000"
                  max="35000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹4,000</span>
                  <span>₹35,000+</span>
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Star Rating</label>
                <div className="flex gap-2">
                  {[5, 4, 3].map((star) => {
                    const active = selectedStars.includes(star);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleToggleStar(star)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                          active
                            ? 'bg-orange-50 border-orange-500 text-orange-600'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${active ? 'fill-orange-500' : 'fill-slate-300'}`} />
                        <span>{star}★</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Property Style</label>
                <div className="space-y-1.5">
                  {(['resort', 'hotel', 'villa', 'heritage'] as PropertyType[]).map((type) => {
                    const active = selectedTypes.includes(type);
                    return (
                      <label
                        key={type}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => handleToggleType(type)}
                          className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Popular Amenities</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {allAmenities.slice(0, 8).map((amenity) => {
                    const active = selectedAmenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => handleToggleAmenity(amenity)}
                          className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Hotel Listings Main Area */}
          <main className="lg:col-span-3 space-y-6">
            {loading ? (
              // Skeleton Loaders
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200/80 animate-pulse flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-64 h-48 bg-slate-200 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="w-1/3 h-4 bg-slate-200 rounded" />
                      <div className="w-2/3 h-6 bg-slate-200 rounded" />
                      <div className="w-full h-12 bg-slate-200 rounded" />
                      <div className="w-1/4 h-8 bg-slate-200 rounded mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHotels.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">No properties found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  We couldn't find any stays matching your filters. Try adjusting price range, amenities, or resetting all filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'map' ? (
              // Map View Cards Grid
              <div className="space-y-4">
                <div className="bg-sky-950 text-white rounded-3xl p-6 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                        Interactive Property Locator
                      </span>
                      <h3 className="text-lg font-bold font-heading">
                        Geographic Distribution Across {selectedCity || 'India'}
                      </h3>
                      <p className="text-xs text-slate-300">
                        Select any property pin below for instant room rates and booking.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      <span>{filteredHotels.length} Locations Mapped</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredHotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex gap-3"
                    >
                      <img
                        src={hotel.photos[0]}
                        alt={hotel.name}
                        className="w-24 h-24 object-cover rounded-xl shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <MapPin className="w-3 h-3 text-orange-600" />
                            <span>{hotel.city}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 font-heading line-clamp-1">{hotel.name}</h4>
                          <span className="text-[10px] text-emerald-600 font-semibold">★ {hotel.averageRating || hotel.starRating} Rating</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-black text-sky-950">₹{hotel.basePrice.toLocaleString('en-IN')}</span>
                          <Link
                            to={`/hotels/${hotel.id}`}
                            className="px-2.5 py-1 text-[11px] font-bold bg-sky-950 hover:bg-orange-600 text-white rounded-lg transition-colors"
                          >
                            Select
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // List View Cards
              <div className="space-y-4">
                {filteredHotels.map((hotel) => {
                  const isWishlisted = wishlistIds.includes(hotel.id);
                  return (
                    <div
                      key={hotel.id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group"
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative md:w-72 h-56 md:h-auto shrink-0 overflow-hidden bg-slate-100">
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
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white">
                              Signature
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleWishlist(hotel)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                            isWishlisted ? 'bg-rose-500 text-white' : 'bg-slate-950/40 text-white hover:bg-slate-950/60'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                <span>{hotel.address}</span>
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-orange-600 transition-colors">
                                {hotel.name}
                              </h3>
                            </div>

                            <div className="bg-sky-50 text-sky-950 px-2.5 py-1 rounded-xl text-right shrink-0">
                              <div className="flex items-center gap-1 text-xs font-black">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{hotel.averageRating || hotel.starRating}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">({hotel.reviewsCount || 42} reviews)</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {hotel.description}
                          </p>

                          {/* Key Amenities */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {hotel.amenities.slice(0, 5).map((amenity) => (
                              <span
                                key={amenity}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-600"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Starting from</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-sky-950 font-heading">
                                ₹{hotel.basePrice.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-slate-500 font-normal">/ night + taxes</span>
                            </div>
                            <span className="text-[10px] text-emerald-600 font-bold block">
                              ✓ Free cancellation available
                            </span>
                          </div>

                          <Link
                            to={`/hotels/${hotel.id}`}
                            className="px-6 py-3 bg-sky-950 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                          >
                            <span>View Available Rooms</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
