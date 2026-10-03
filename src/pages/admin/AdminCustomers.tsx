import React, { useState, useEffect } from 'react';
import { getCustomers, toggleCustomerBlock } from '../../services/db';
import { UserProfile } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Users, Search, ShieldAlert, ShieldCheck, Mail, Phone } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (u: UserProfile) => {
    const nextState = !u.isBlocked;
    try {
      await toggleCustomerBlock(u.uid, nextState);
      showToast(`User ${u.fullName} ${nextState ? 'blocked' : 'unblocked'}`, 'info');
      await fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-heading">Registered Customers</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage customer directories, view verification status, and enforce account access controls.
          </p>
        </div>
      </div>

      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} Users</span>
      </div>

      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filtered.map((c) => (
                <tr key={c.uid} className="hover:bg-slate-700/30">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-950 text-white font-bold flex items-center justify-center font-heading text-xs shrink-0">
                      {c.fullName ? c.fullName.charAt(0) : 'U'}
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block">{c.fullName || 'Traveler'}</span>
                      <span className="text-[11px] text-slate-400">UID: {c.uid.substring(0, 10)}...</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300 block">{c.email}</span>
                    <span className="text-[11px] text-slate-400">{c.phoneNumber || 'No phone'}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.role === 'super_admin'
                          ? 'bg-purple-500/20 text-purple-300'
                          : c.role === 'admin'
                          ? 'bg-sky-500/20 text-sky-300'
                          : c.role === 'agent'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {c.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.isBlocked ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {c.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(c)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        c.isBlocked
                          ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                          : 'bg-rose-950 text-rose-300 hover:bg-rose-900'
                      }`}
                    >
                      {c.isBlocked ? 'Unblock User' : 'Block User'}
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
