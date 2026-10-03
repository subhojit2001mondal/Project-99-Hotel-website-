import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getWishlist, toggleWishlist } from '../services/db';
import { WishlistItem } from '../types';
import { Heart, Trash2, ArrowRight, MapPin, Star } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getWishlist(user.uid);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const handleRemove = async (item: WishlistItem) => {
    if (!user) return;
    try {
      await toggleWishlist(user.uid, item);
      setItems((prev) => prev.filter((i) => i.itemId !== item.itemId));
      showToast('Removed from wishlist', 'info');
    } catch {
      showToast('Error removing item', 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Sign In to View Wishlist</h2>
        <Link to="/" className="mt-4 px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold inline-block">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
              <Heart className="w-4 h-4 fill-current" />
              <span>Saved Luxury Stays</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              My Saved Wishlist
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {items.length} propert{items.length === 1 ? 'y' : 'ies'} saved for your upcoming journeys
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-3xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Tap the heart icon on any hotel or tour package card to save it here for later.
            </p>
            <Link
              to="/hotels"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors inline-block"
            >
              Browse Hotels & Resorts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={item.itemPhoto}
                      alt={item.itemTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="absolute top-3 right-3 p-2 bg-slate-950/40 hover:bg-rose-600 text-white rounded-full backdrop-blur-md transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span>{item.itemCity}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-heading line-clamp-1">
                      {item.itemTitle}
                    </h3>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Starts from</span>
                      <span className="text-lg font-black text-sky-950 font-heading">
                        ₹{item.itemPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Link
                      to={item.itemType === 'hotel' ? `/hotels/${item.itemId}` : `/packages/${item.itemId}`}
                      className="px-4 py-2 bg-sky-950 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span>View & Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
