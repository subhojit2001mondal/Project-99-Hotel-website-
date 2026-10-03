import React, { useState, useEffect } from 'react';
import { getPackages, savePackage, deletePackage, getAgents } from '../../services/db';
import { TourPackage, Agent, ItineraryDay } from '../../types';
import { useToast } from '../../context/ToastContext';
import { uploadImageWithFallback } from '../../utils/imageUpload';
import {
  Palmtree,
  Plus,
  Edit2,
  Trash2,
  Search,
  Star,
  Check,
  X,
  Upload,
  Calendar,
  Users
} from 'lucide-react';

export const AdminPackages: React.FC = () => {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Partial<TourPackage> | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [durationNights, setDurationNights] = useState(4);
  const [pricePerPerson, setPricePerPerson] = useState(19999);
  const [description, setDescription] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState(15);
  const [isPublished, setIsPublished] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [highlightsStr, setHighlightsStr] = useState('');
  const [inclusionsStr, setInclusionsStr] = useState('');
  const [exclusionsStr, setExclusionsStr] = useState('');
  const [departureDatesStr, setDepartureDatesStr] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState('');
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  // New day item state
  const [dayTitle, setDayTitle] = useState('');
  const [dayDesc, setDayDesc] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pList, aList] = await Promise.all([getPackages(), getAgents()]);
      setPackages(pList);
      setAgents(aList);
      if (aList.length > 0) setSelectedAgentId(aList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAddModal = () => {
    setEditingPkg(null);
    setTitle('');
    setDestination('');
    setDurationDays(5);
    setDurationNights(4);
    setPricePerPerson(18999);
    setDescription('');
    setMaxGroupSize(14);
    setIsPublished(true);
    setHighlightsStr('Overnight luxury houseboat stay, Cable car ride, Local cuisine tasting');
    setInclusionsStr('4 Nights 4-star accommodation, Daily breakfast and dinner, Private AC transfers');
    setExclusionsStr('Domestic airfare, Personal shopping, Monument entry fees');
    setDepartureDatesStr('2026-10-25, 2026-11-10, 2026-11-25');
    setPhotos([
      'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'
    ]);
    setItinerary([
      { day: 1, title: 'Arrival & Welcome Reception', description: 'Airport pickup and check-in to boutique hotel with sunset welcome drink.' },
      { day: 2, title: 'Guided Sightseeing & Heritage Walk', description: 'Explore ancient fortresses, royal gardens, and traditional artisan markets.' }
    ]);
    setModalOpen(true);
  };

  const openEditModal = (p: TourPackage) => {
    setEditingPkg(p);
    setTitle(p.title);
    setDestination(p.destination);
    setDurationDays(p.durationDays);
    setDurationNights(p.durationNights);
    setPricePerPerson(p.pricePerPerson);
    setDescription(p.description);
    setMaxGroupSize(p.maxGroupSize);
    setIsPublished(p.isPublished);
    setSelectedAgentId(p.agentId || '');
    setHighlightsStr(p.highlights.join(', '));
    setInclusionsStr(p.inclusions.join(', '));
    setExclusionsStr(p.exclusions.join(', '));
    setDepartureDatesStr(p.departureDates.join(', '));
    setPhotos(p.photos || []);
    setItinerary(p.itinerary || []);
    setModalOpen(true);
  };

  const handleAddDay = () => {
    if (!dayTitle.trim()) return;
    const nextDayNum = itinerary.length + 1;
    setItinerary((prev) => [
      ...prev,
      { day: nextDayNum, title: dayTitle.trim(), description: dayDesc.trim() || 'Day at leisure and sightseeing.' }
    ]);
    setDayTitle('');
    setDayDesc('');
  };

  const handleRemoveDay = (dayNum: number) => {
    setItinerary((prev) => prev.filter((d) => d.day !== dayNum));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim() || pricePerPerson <= 0) {
      showToast('Please fill all required package fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const assignedAgent = agents.find((a) => a.id === selectedAgentId);

      const payload: Partial<TourPackage> = {
        ...(editingPkg || {}),
        title: title.trim(),
        destination: destination.trim(),
        durationDays,
        durationNights,
        pricePerPerson,
        description: description.trim(),
        maxGroupSize,
        isPublished,
        agentId: selectedAgentId,
        agentName: assignedAgent?.agencyName || 'Himalayan Horizons Expeditions',
        agentPhone: assignedAgent?.phone || '+91 98765 43210',
        highlights: highlightsStr.split(',').map((s) => s.trim()).filter(Boolean),
        inclusions: inclusionsStr.split(',').map((s) => s.trim()).filter(Boolean),
        exclusions: exclusionsStr.split(',').map((s) => s.trim()).filter(Boolean),
        departureDates: departureDatesStr.split(',').map((s) => s.trim()).filter(Boolean),
        photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80'],
        itinerary,
        rating: editingPkg?.rating || 4.9
      };

      await savePackage(payload);
      showToast('Tour package saved successfully!', 'success');
      setModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to save package', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pkgId: string) => {
    if (confirm('Delete this tour package?')) {
      try {
        await deletePackage(pkgId);
        showToast('Package deleted', 'info');
        await fetchAll();
      } catch (err: any) {
        showToast(err.message || 'Delete failed', 'error');
      }
    }
  };

  const filtered = packages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-heading">Tour Package Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure multi-day itineraries, group sizes, fixed departures, and agent attribution.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Package</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by package title or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} Packages</span>
      </div>

      {/* Packages Table */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Package</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Price / Person</th>
                <th className="p-4">Departures</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filtered.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-700/30">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={pkg.photos[0]}
                      alt=""
                      className="w-12 h-12 object-cover rounded-xl shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white text-sm block">{pkg.title}</span>
                      <span className="text-[10px] text-slate-400">Agent: {pkg.agentName || 'Platform Direct'}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-orange-400">{pkg.destination}</td>
                  <td className="p-4 text-slate-300">{pkg.durationDays}D / {pkg.durationNights}N</td>
                  <td className="p-4 font-bold text-white">₹{pkg.pricePerPerson.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-slate-400">{pkg.departureDates?.length || 0} dates</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        pkg.isPublished
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {pkg.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(pkg)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pkg.id)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white font-heading">
                {editingPkg ? 'Edit Tour Package' : 'Create New Holiday Package'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Package Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Price Per Person (INR) *</label>
                  <input
                    type="number"
                    required
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Duration (Days / Nights)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-1/2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                    <input
                      type="number"
                      value={durationNights}
                      onChange={(e) => setDurationNights(Number(e.target.value))}
                      className="w-1/2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Assigned Tour Agent</label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.agencyName} ({a.contactName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Overview Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Departure Dates (YYYY-MM-DD comma separated)</label>
                <input
                  type="text"
                  value={departureDatesStr}
                  onChange={(e) => setDepartureDatesStr(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Inclusions (Comma separated)</label>
                <input
                  type="text"
                  value={inclusionsStr}
                  onChange={(e) => setInclusionsStr(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              {/* Day-Wise Itinerary Builder */}
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700 space-y-3">
                <span className="font-bold text-slate-300 block">Itinerary Builder</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Day Title"
                    value={dayTitle}
                    onChange={(e) => setDayTitle(e.target.value)}
                    className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
                  >
                    + Add Day
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {itinerary.map((d) => (
                    <div key={d.day} className="p-2.5 bg-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-orange-400">Day {d.day}:</span>
                        <span className="text-white ml-2">{d.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(d.day)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-orange-600"
                  />
                  <span>Published (Visible to travelers)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
