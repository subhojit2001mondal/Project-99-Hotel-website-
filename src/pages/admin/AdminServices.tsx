import React, { useState, useEffect } from 'react';
import { getServices, saveService, deleteService } from '../../services/db';
import { TravelService, ServiceType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Car, Plus, Edit2, Trash2, X, MapPin } from 'lucide-react';

export const AdminServices: React.FC = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState<TravelService[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<TravelService> | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ServiceType>('transfer');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState(1800);
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('Single Trip');
  const [vehicleOrDetails, setVehicleOrDetails] = useState('');
  const [photo, setPhoto] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setTitle('');
    setType('transfer');
    setCity('Goa');
    setPrice(1800);
    setDescription('Airport sanitized sedan pickup with baggage assistance.');
    setDuration('Single Trip');
    setVehicleOrDetails('Toyota Camry / Honda City (Max 3 Guests)');
    setPhoto('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80');
    setIsAvailable(true);
    setModalOpen(true);
  };

  const openEditModal = (srv: TravelService) => {
    setEditingService(srv);
    setTitle(srv.title);
    setType(srv.type);
    setCity(srv.city);
    setPrice(srv.price);
    setDescription(srv.description);
    setDuration(srv.duration || '');
    setVehicleOrDetails(srv.vehicleOrDetails || '');
    setPhoto(srv.photos[0] || '');
    setIsAvailable(srv.isAvailable);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price <= 0) return;

    try {
      await saveService({
        ...(editingService || {}),
        title: title.trim(),
        type,
        city: city.trim(),
        price,
        description: description.trim(),
        duration,
        vehicleOrDetails,
        photos: [photo || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'],
        isAvailable
      });
      showToast('Service saved successfully!', 'success');
      setModalOpen(false);
      await fetchServices();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this service?')) {
      try {
        await deleteService(id);
        showToast('Service deleted', 'info');
        await fetchServices();
      } catch {
        showToast('Delete failed', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-heading">Mobility & Add-on Services</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage airport luxury sedans, city tours, cruise excursions, and adventure experiences.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Travel Service</span>
        </button>
      </div>

      {/* Grid of services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden flex flex-col justify-between"
          >
            <div>
              <img src={srv.photos[0]} alt="" className="w-full h-40 object-cover" />
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                    {srv.type}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{srv.city}</span>
                </div>
                <h3 className="text-sm font-bold text-white font-heading">{srv.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{srv.description}</p>
                <p className="text-[11px] text-slate-300 font-semibold">{srv.vehicleOrDetails}</p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                <span className="text-base font-black text-white">₹{srv.price.toLocaleString('en-IN')}</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(srv)}
                    className="p-1.5 rounded-lg bg-slate-700 text-slate-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(srv.id)}
                    className="p-1.5 rounded-lg bg-rose-950 text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-800 rounded-3xl p-6 space-y-4 border border-slate-700 text-xs text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h2 className="text-base font-bold font-heading">
                {editingService ? 'Edit Service' : 'Add Travel Service'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Service Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="transfer">Airport Transfer</option>
                    <option value="cab">Sightseeing Cab</option>
                    <option value="activity">Tour / Activity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Operating City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Vehicle / Inclusions Details</label>
                <input
                  type="text"
                  value={vehicleOrDetails}
                  onChange={(e) => setVehicleOrDetails(e.target.value)}
                  placeholder="e.g. Toyota Innova (Max 6 Guests)"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Photo URL</label>
                <input
                  type="url"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
