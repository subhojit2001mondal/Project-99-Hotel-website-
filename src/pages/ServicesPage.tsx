import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../services/db';
import { TravelService, ServiceType } from '../types';
import { Car, Clock, ShieldCheck, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<TravelService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const list = await getServices();
        setServices(list);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = services.filter((srv) => {
    if (activeCategory === 'all') return true;
    return srv.type === activeCategory;
  });

  const handleBookService = (service: TravelService) => {
    const params = new URLSearchParams({
      type: 'service',
      itemId: service.id,
      itemName: service.title,
      rate: service.price.toString()
    });
    navigate(`/book?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              <Car className="w-4 h-4" />
              <span>Chauffeured Mobility & Experiences</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Cabs, Airport Transfers & Activities
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Guaranteed on-time sanitized sedans, luxury SUVs, and licensed adventure activities.
            </p>
          </div>

          {/* Filter categories */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl overflow-x-auto">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'transfer', label: 'Airport Transfers' },
              { id: 'cab', label: 'Sightseeing Cabs' },
              { id: 'activity', label: 'Adventures & Tours' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-sky-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-sky-950'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={service.photos[0]}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-sky-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider">
                      {service.type}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      <span>{service.city}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 font-heading group-hover:text-orange-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                      {service.duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-800 shrink-0" />
                          <span>Duration: {service.duration}</span>
                        </div>
                      )}
                      {service.vehicleOrDetails && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{service.vehicleOrDetails}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Fixed Price</span>
                      <span className="text-xl font-black text-sky-950 font-heading">
                        ₹{service.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookService(service)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>Book Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
