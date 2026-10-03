import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPackages } from '../services/db';
import { TourPackage } from '../types';
import {
  Palmtree,
  Calendar,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';

export const PackageListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryDest = searchParams.get('destination') || '';

  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDestination, setSelectedDestination] = useState(queryDest);
  const [maxBudget, setMaxBudget] = useState(50000);
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high'>('popular');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const list = await getPackages();
        setPackages(list);
      } catch (err) {
        console.error('Failed to load packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const destinations = ['All Destinations', ...Array.from(new Set(packages.map((p) => p.destination)))];

  const filtered = packages
    .filter((pkg) => {
      if (
        selectedDestination &&
        selectedDestination !== 'All Destinations' &&
        pkg.destination.toLowerCase() !== selectedDestination.toLowerCase()
      ) {
        return false;
      }
      if (pkg.pricePerPerson > maxBudget) {
        return false;
      }
      if (selectedDuration === 'short' && pkg.durationDays > 4) return false;
      if (selectedDuration === 'medium' && (pkg.durationDays < 5 || pkg.durationDays > 7)) return false;
      if (selectedDuration === 'long' && pkg.durationDays < 8) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.pricePerPerson - b.pricePerPerson;
      if (sortBy === 'price_high') return b.pricePerPerson - a.pricePerPerson;
      return b.rating - a.rating;
    });

  const handleReset = () => {
    setSelectedDestination('');
    setMaxBudget(50000);
    setSelectedDuration('all');
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 font-heading">Curated Tour Packages</h1>
              <p className="text-xs text-slate-500">
                {filtered.length} all-inclusive holiday itineraries available
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="popular">Top Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-600" />
                  Filters
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Destination</label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {destinations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-700">Max Budget / Person</span>
                  <span className="text-orange-600 font-heading">₹{maxBudget.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="50000"
                  step="2000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹15,000</span>
                  <span>₹50,000+</span>
                </div>
              </div>

              {/* Duration Radio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Trip Duration</label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'all', label: 'Any Duration' },
                    { id: 'short', label: '1 - 4 Days (Quick Escape)' },
                    { id: 'medium', label: '5 - 7 Days (Popular)' },
                    { id: 'long', label: '8+ Days (Extended Tour)' }
                  ].map((dur) => (
                    <label key={dur.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        name="duration"
                        checked={selectedDuration === dur.id}
                        onChange={() => setSelectedDuration(dur.id)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span>{dur.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Packages List */}
          <main className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 h-48 animate-pulse bg-slate-200" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Palmtree className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No packages match your search</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Try relaxing your budget or destination filter.</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group"
                  >
                    <div className="relative md:w-72 h-56 md:h-auto shrink-0 overflow-hidden bg-slate-100">
                      <img
                        src={pkg.photos[0]}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-sky-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider">
                        {pkg.durationDays}D / {pkg.durationNights}N
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                            {pkg.destination} Tour
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{pkg.rating}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 font-heading mt-1 group-hover:text-orange-600 transition-colors">
                          {pkg.title}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {pkg.description}
                        </p>

                        <div className="mt-3 space-y-1">
                          {pkg.highlights.slice(0, 3).map((h, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">All-inclusive from</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-sky-950 font-heading">
                              ₹{pkg.pricePerPerson.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-slate-500 font-normal">/ traveler</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">Agent: {pkg.agentName || 'Verified Operator'}</span>
                        </div>

                        <Link
                          to={`/packages/${pkg.id}`}
                          className="px-6 py-3 bg-sky-950 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                        >
                          <span>View Full Itinerary</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
