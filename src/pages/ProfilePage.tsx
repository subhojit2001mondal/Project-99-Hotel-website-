import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SavedTraveler } from '../types';
import { User, Phone, Mail, ShieldCheck, Plus, Trash2, CheckCircle2, UserPlus } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile, role, isVerified, resendVerification, updateUserSavedTravelers } = useAuth();
  const { showToast } = useToast();

  const [travelers, setTravelers] = useState<SavedTraveler[]>(profile?.savedTravelers || []);
  const [showAddTraveler, setShowAddTraveler] = useState(false);

  // New Traveler form
  const [tName, setTName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tIdType, setTIdType] = useState<SavedTraveler['idType']>('Aadhaar');
  const [tIdNumber, setTIdNumber] = useState('');

  const handleAddTraveler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim() || !tEmail.trim()) {
      showToast('Name and email are required for saved travelers.', 'error');
      return;
    }

    const newTraveler: SavedTraveler = {
      id: `trv_${Date.now()}`,
      fullName: tName.trim(),
      email: tEmail.trim(),
      phoneNumber: tPhone.trim(),
      idType: tIdType,
      idNumber: tIdNumber.trim()
    };

    const updated = [...travelers, newTraveler];
    setTravelers(updated);
    await updateUserSavedTravelers(updated);

    showToast('Saved co-traveler added!', 'success');
    setShowAddTraveler(false);
    setTName('');
    setTEmail('');
    setTPhone('');
    setTIdNumber('');
  };

  const handleRemoveTraveler = async (id: string) => {
    const updated = travelers.filter((t) => t.id !== id);
    setTravelers(updated);
    await updateUserSavedTravelers(updated);
    showToast('Saved traveler removed', 'info');
  };

  const handleResend = async () => {
    try {
      await resendVerification();
      showToast('Verification email resent! Check your inbox.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to send verification email', 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Please Sign In</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-950 via-blue-900 to-sky-800 text-white font-black text-2xl flex items-center justify-center font-heading shadow-md">
                {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 font-heading">
                    {profile?.fullName || 'Traveler'}
                  </h1>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    {role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="text-right">
              {isVerified ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Email Verified</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl">
                    Unverified Email
                  </span>
                  <button
                    type="button"
                    onClick={handleResend}
                    className="block text-[11px] text-orange-600 hover:underline font-semibold ml-auto"
                  >
                    Resend Link
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                Full Name
              </span>
              <span className="font-bold text-slate-800 text-sm">{profile?.fullName}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                Email Address
              </span>
              <span className="font-bold text-slate-800 text-sm truncate block">{user.email}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                Phone Number
              </span>
              <span className="font-bold text-slate-800 text-sm">{profile?.phoneNumber || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Saved Co-Travelers Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">Saved Co-Travelers</h2>
              <p className="text-xs text-slate-500">
                Save family and friends for 1-click guest autofill during checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTraveler(!showAddTraveler)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Traveler</span>
            </button>
          </div>

          {/* Add Traveler Form */}
          {showAddTraveler && (
            <form
              onSubmit={handleAddTraveler}
              className="p-5 rounded-2xl bg-orange-50/40 border border-orange-200/60 space-y-4 animate-fade-in"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-950">New Traveler Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Legal Name *"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={tEmail}
                  onChange={(e) => setTEmail(e.target.value)}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={tPhone}
                  onChange={(e) => setTPhone(e.target.value)}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
                <div className="flex gap-2">
                  <select
                    value={tIdType}
                    onChange={(e) => setTIdType(e.target.value as any)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                  >
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                  <input
                    type="text"
                    placeholder="ID Number (Optional)"
                    value={tIdNumber}
                    onChange={(e) => setTIdNumber(e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTraveler(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Traveler
                </button>
              </div>
            </form>
          )}

          {travelers.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl">
              No saved co-travelers yet. Add family members above for faster reservations.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {travelers.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.fullName}</h4>
                    <p className="text-[11px] text-slate-500">{t.email} • {t.phoneNumber}</p>
                    {t.idNumber && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.idType}: {t.idNumber}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTraveler(t.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
