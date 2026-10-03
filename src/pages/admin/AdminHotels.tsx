import React, { useState, useEffect } from 'react';
import { getHotels, saveHotel, deleteHotel } from '../../services/db';
import { Hotel, HotelRoom, PropertyType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { uploadImageWithFallback } from '../../utils/imageUpload';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  Search,
  Star,
  MapPin,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';

export const AdminHotels: React.FC = () => {
  const { showToast } = useToast();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Partial<Hotel> | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('hotel');
  const [starRating, setStarRating] = useState(5);
  const [basePrice, setBasePrice] = useState(8000);
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [amenitiesStr, setAmenitiesStr] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Rooms state
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [roomName, setRoomName] = useState('');
  const [roomPrice, setRoomPrice] = useState(8000);
  const [roomCapacity, setRoomCapacity] = useState(2);
  const [roomTotal, setRoomTotal] = useState(10);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const data = await getHotels();
      setHotels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const openAddModal = () => {
    setEditingHotel(null);
    setName('');
    setCity('');
    setAddress('');
    setPropertyType('hotel');
    setStarRating(5);
    setBasePrice(8000);
    setDescription('');
    setFeatured(false);
    setIsPublished(true);
    setAmenitiesStr('Swimming Pool, Free High-Speed WiFi, Spa, Fine Dining, Room Service');
    setPhotos([
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ]);
    setRooms([
      {
        id: `rm_${Date.now()}`,
        hotelId: '',
        name: 'Deluxe Room with Balcony',
        description: 'Spacious room with king bed and balcony.',
        capacityGuests: 2,
        bedType: '1 King Bed',
        pricePerNight: 8000,
        totalRooms: 10,
        amenities: ['Air conditioning', 'WiFi', 'Mini bar'],
        photos: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
        cancellationPolicy: 'Free cancellation up to 48h'
      }
    ]);
    setModalOpen(true);
  };

  const openEditModal = (h: Hotel) => {
    setEditingHotel(h);
    setName(h.name);
    setCity(h.city);
    setAddress(h.address);
    setPropertyType(h.propertyType);
    setStarRating(h.starRating);
    setBasePrice(h.basePrice);
    setDescription(h.description);
    setFeatured(h.featured);
    setIsPublished(h.isPublished);
    setAmenitiesStr(h.amenities.join(', '));
    setPhotos(h.photos || []);
    setRooms(h.rooms || []);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setUploadProgress(10);
    try {
      const url = await uploadImageWithFallback(file, 'hotels', (p) => setUploadProgress(p));
      setPhotos((prev) => [...prev, url]);
      showToast('Photo uploaded and compressed successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to upload image', 'error');
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  const handleAddPhotoUrl = () => {
    if (photoInput.trim()) {
      setPhotos((prev) => [...prev, photoInput.trim()]);
      setPhotoInput('');
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddRoom = () => {
    if (!roomName.trim()) return;
    const newRoom: HotelRoom = {
      id: `rm_${Date.now()}`,
      hotelId: editingHotel?.id || '',
      name: roomName.trim(),
      description: 'Well-appointed room with modern comforts.',
      capacityGuests: roomCapacity,
      bedType: '1 King Bed',
      pricePerNight: roomPrice,
      totalRooms: roomTotal,
      amenities: ['High-speed WiFi', '4K Smart TV', 'Air conditioning'],
      photos: [photos[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
      cancellationPolicy: 'Free cancellation up to 48h'
    };
    setRooms((prev) => [...prev, newRoom]);
    setRoomName('');
    showToast('Room type added', 'success');
  };

  const handleRemoveRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || basePrice <= 0) {
      showToast('Please fill all required hotel fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Hotel> = {
        ...(editingHotel || {}),
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
        propertyType,
        starRating,
        basePrice,
        description: description.trim(),
        featured,
        isPublished,
        amenities: amenitiesStr.split(',').map((s) => s.trim()).filter(Boolean),
        photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
        policies: {
          checkIn: '14:00',
          checkOut: '11:00',
          cancellation: 'Free cancellation up to 48 hours prior to arrival',
          petsAllowed: false
        },
        rooms
      };

      await saveHotel(payload);
      showToast('Hotel saved successfully!', 'success');
      setModalOpen(false);
      await fetchHotels();
    } catch (err: any) {
      showToast(err.message || 'Failed to save hotel', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (hotelId: string) => {
    if (confirm('Are you sure you want to remove this property?')) {
      try {
        await deleteHotel(hotelId);
        showToast('Hotel removed', 'info');
        await fetchHotels();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete hotel', 'error');
      }
    }
  };

  const filtered = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-heading">Hotel Chain Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create properties, configure room types, manage photo galleries, and update live pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hotel</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search hotels by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} Properties</span>
      </div>

      {/* Hotels Table */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Property</th>
                <th className="p-4">Location</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Base Fare</th>
                <th className="p-4">Rooms</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filtered.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-slate-700/30">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={hotel.photos[0]}
                      alt=""
                      className="w-12 h-12 object-cover rounded-xl shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white text-sm block">{hotel.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{hotel.propertyType}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      <span>{hotel.city}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{hotel.starRating}★</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">₹{hotel.basePrice.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-slate-300">{hotel.rooms?.length || 0} categories</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        hotel.isPublished
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {hotel.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(hotel)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(hotel.id)}
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

      {/* ADD / EDIT HOTEL MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white font-heading">
                {editingHotel ? 'Edit Property Details' : 'Add New Luxury Hotel'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Hotel Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">City / Hub *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Full Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="resort">Resort</option>
                    <option value="villa">Villa</option>
                    <option value="heritage">Heritage Palace</option>
                    <option value="apartment">Apartment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Base Price / Night (INR) *</label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Amenities (Comma separated)</label>
                <input
                  type="text"
                  value={amenitiesStr}
                  onChange={(e) => setAmenitiesStr(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              {/* Photo Upload with Compression */}
              <div className="space-y-2 p-4 bg-slate-900/60 rounded-2xl border border-slate-700">
                <label className="block text-slate-300 font-bold">
                  Property Photos (Compressed Storage Upload)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-4 py-2 bg-sky-900 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Or paste image URL..."
                      value={photoInput}
                      onChange={(e) => setPhotoInput(e.target.value)}
                      className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="px-3 py-2 bg-slate-700 text-white rounded-xl text-xs font-bold"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {uploadingPhoto && (
                  <div className="flex items-center gap-2 text-xs text-orange-400">
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span>{uploadProgress}%</span>
                  </div>
                )}

                <div className="flex gap-2 overflow-x-auto py-2">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 group">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute inset-0 bg-rose-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Categories Sub-Builder */}
              <div className="space-y-3 p-4 bg-slate-900/60 rounded-2xl border border-slate-700">
                <span className="block font-bold text-slate-300">Room Categories & Inventory</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Room Name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                  <input
                    type="number"
                    placeholder="Price/night"
                    value={roomPrice}
                    onChange={(e) => setRoomPrice(Number(e.target.value))}
                    className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                  <input
                    type="number"
                    placeholder="Total Rooms"
                    value={roomTotal}
                    onChange={(e) => setRoomTotal(Number(e.target.value))}
                    className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddRoom}
                    className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
                  >
                    + Add Room
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {rooms.map((r) => (
                    <div key={r.id} className="p-2.5 bg-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{r.name}</span>
                        <span className="text-[11px] text-slate-400 ml-2">
                          ₹{r.pricePerNight} / night • {r.totalRooms} rooms capacity
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRoom(r.id)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-orange-600"
                  />
                  <span>Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-orange-600"
                  />
                  <span>Published (Visible to public)</span>
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
                  {saving ? 'Saving...' : 'Save Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
