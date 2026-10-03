import React, { useState, useEffect } from 'react';
import { getAllReviews, updateReviewStatus } from '../../services/db';
import { Review } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Star, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdate = async (revId: string, status: 'approved' | 'rejected') => {
    try {
      await updateReviewStatus(revId, status);
      showToast(`Review marked as ${status}`, 'success');
      await fetchReviews();
    } catch (err: any) {
      showToast('Status update failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-heading">Guest Reviews Moderation</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review, approve, or reject user-submitted feedback before public display on property pages.
        </p>
      </div>

      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Guest</th>
                <th className="p-4">Target Property</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-700/30">
                  <td className="p-4 font-bold text-white">{r.userName}</td>
                  <td className="p-4 text-slate-300">
                    <span className="uppercase text-[10px] font-bold text-orange-400 block">{r.targetType}</span>
                    <span className="truncate max-w-[150px] block">{r.targetId}</span>
                  </td>
                  <td className="p-4 text-amber-400 font-bold">★ {r.rating}.0</td>
                  <td className="p-4 text-slate-300 max-w-sm">
                    <p className="line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : r.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(r.id, 'approved')}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-950 text-emerald-300 hover:bg-emerald-900 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(r.id, 'rejected')}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-950 text-rose-300 hover:bg-rose-900 transition-colors"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
