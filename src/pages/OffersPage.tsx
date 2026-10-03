import React, { useState, useEffect } from 'react';
import { getCoupons, getBanners } from '../services/db';
import { Coupon, Banner } from '../types';
import { useToast } from '../context/ToastContext';
import { Tag, Copy, Sparkles, CheckCircle2, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OffersPage: React.FC = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [cList, bList] = await Promise.all([getCoupons(), getBanners()]);
        setCoupons(cList);
        setBanners(bList);
      } catch (err) {
        console.error('Failed to load offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Code "${code}" copied to clipboard!`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              <Ticket className="w-4 h-4" />
              <span>Privileges & Secret Promo Codes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Exclusive Illusion Offers & Coupons
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enjoy verified instant deductions on your next luxury stay or holiday package.
            </p>
          </div>
        </div>

        {/* Promotional Hero Banners */}
        {banners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="relative rounded-3xl overflow-hidden aspect-[16/8] shadow-md group"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  {banner.discountTag && (
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white w-fit mb-2">
                      {banner.discountTag}
                    </span>
                  )}
                  <h3 className="text-lg font-bold font-heading">{banner.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{banner.subtitle}</p>
                  <Link
                    to={banner.link || '/hotels'}
                    className="mt-3 px-4 py-1.5 bg-white text-sky-950 hover:bg-orange-500 hover:text-white rounded-xl text-xs font-bold w-fit transition-colors"
                  >
                    View Offer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coupons Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 font-heading">Active Discount Coupons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-3xl p-5 border-2 border-dashed border-slate-200 shadow-xs flex flex-col justify-between hover:border-orange-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700">
                      {coupon.discountType === 'flat' ? `FLAT ₹${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between mb-3">
                    <span className="font-mono text-base font-black text-sky-950 tracking-wider">
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(coupon.code)}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">
                    Applicable on bookings above ₹{coupon.minAmount.toLocaleString('en-IN')}.
                    {coupon.maxDiscount ? ` Maximum discount capped at ₹${coupon.maxDiscount}.` : ''}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Usage: {coupon.timesUsed} redeemed</span>
                  <span className="text-emerald-600 font-semibold">Active & Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
