import React, { useState, useEffect } from 'react';
import { getCoupons, saveCoupon, deleteCoupon, getBanners, saveBanner } from '../../services/db';
import { Coupon, Banner } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Ticket, Plus, Trash2, Tag, Image, X } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Coupon modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('flat');
  const [discountValue, setDiscountValue] = useState(500);
  const [minAmount, setMinAmount] = useState(3000);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(undefined);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  // Banner modal
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bImage, setBImage] = useState('');
  const [bLink, setBLink] = useState('/hotels');
  const [bTag, setBTag] = useState('PROMO');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cList, bList] = await Promise.all([getCoupons(), getBanners()]);
      setCoupons(cList);
      setBanners(bList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue <= 0) return;

    try {
      await saveCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue,
        minAmount,
        maxDiscount,
        expiryDate,
        usageLimit: 1000,
        timesUsed: 0,
        isActive: true
      });
      showToast(`Coupon ${code} created!`, 'success');
      setCouponModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to save coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm('Delete this coupon?')) {
      try {
        await deleteCoupon(id);
        showToast('Coupon removed', 'info');
        await fetchAll();
      } catch {
        showToast('Delete failed', 'error');
      }
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bImage.trim()) return;

    try {
      await saveBanner({
        title: bTitle.trim(),
        subtitle: bSubtitle.trim(),
        image: bImage.trim(),
        link: bLink.trim(),
        discountTag: bTag.trim(),
        isActive: true,
        order: banners.length + 1
      });
      showToast('Banner created!', 'success');
      setBannerModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to save banner', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-heading">Marketing, Coupons & Banners</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure promotional promo codes and homepage carousel banners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCouponModalOpen(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
          <button
            type="button"
            onClick={() => setBannerModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
          <Tag className="w-4 h-4 text-orange-400" />
          Active Discount Coupons
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-orange-400">{c.code}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-bold text-white mt-1">
                  {c.discountType === 'flat' ? `Flat ₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Min Spend: ₹{c.minAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Used: {c.timesUsed} times</span>
                <span>Exp: {c.expiryDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banners Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
          <Image className="w-4 h-4 text-sky-400" />
          Homepage Promo Banners
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden"
            >
              <img src={b.image} alt="" className="w-full h-36 object-cover" />
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-bold text-orange-400 uppercase">{b.discountTag}</span>
                <h4 className="text-xs font-bold text-white font-heading line-clamp-1">{b.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{b.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE COUPON MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-800 rounded-3xl p-6 space-y-4 border border-slate-700 text-xs text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-bold text-sm">Create Promo Coupon</h3>
              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white uppercase font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Min Spend (INR)</label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BANNER MODAL */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-800 rounded-3xl p-6 space-y-4 border border-slate-700 text-xs text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-bold text-sm">Add Homepage Promo Banner</h3>
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Subtitle</label>
                <input
                  type="text"
                  value={bSubtitle}
                  onChange={(e) => setBSubtitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={bImage}
                  onChange={(e) => setBImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={bTag}
                    onChange={(e) => setBTag(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Link</label>
                  <input
                    type="text"
                    value={bLink}
                    onChange={(e) => setBLink(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
