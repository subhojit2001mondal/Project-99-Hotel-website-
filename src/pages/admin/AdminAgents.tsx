import React, { useState, useEffect } from 'react';
import { getAgents, saveAgent } from '../../services/db';
import { Agent } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Users2, Plus, Edit2, ShieldAlert, CheckCircle2, Phone, Mail, Star, X } from 'lucide-react';

export const AdminAgents: React.FC = () => {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Partial<Agent> | null>(null);
  const [agencyName, setAgencyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);
  const [status, setStatus] = useState<Agent['status']>('approved');

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const openAddModal = () => {
    setEditingAgent(null);
    setAgencyName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setCommissionRate(10);
    setStatus('approved');
    setModalOpen(true);
  };

  const openEditModal = (a: Agent) => {
    setEditingAgent(a);
    setAgencyName(a.agencyName);
    setContactName(a.contactName);
    setEmail(a.email);
    setPhone(a.phone);
    setCommissionRate(a.commissionRate);
    setStatus(a.status);
    setModalOpen(true);
  };

  const handleToggleStatus = async (agent: Agent) => {
    const newStatus = agent.status === 'approved' ? 'suspended' : 'approved';
    try {
      await saveAgent({ id: agent.id, status: newStatus });
      showToast(`Agent status updated to ${newStatus}`, 'info');
      await fetchAgents();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim() || !email.trim()) {
      showToast('Agency name and email are required.', 'error');
      return;
    }

    try {
      await saveAgent({
        ...(editingAgent || {}),
        agencyName: agencyName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        commissionRate,
        status,
        rating: editingAgent?.rating || 4.8,
        totalBookings: editingAgent?.totalBookings || 0
      });
      showToast('Agent profile saved successfully!', 'success');
      setModalOpen(false);
      await fetchAgents();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-heading">Tour Operator Agents</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Onboard registered tour agencies, configure commission shares, and manage approval status.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Agent</span>
        </button>
      </div>

      {/* Agents Table */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Agency</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Commission %</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Total Stays Booked</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-700/30">
                  <td className="p-4">
                    <span className="font-bold text-white text-sm block">{agent.agencyName}</span>
                    <span className="text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {agent.email}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="font-medium text-white">{agent.contactName}</span>
                    <span className="text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {agent.phone}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-orange-400">{agent.commissionRate}%</td>
                  <td className="p-4 text-amber-400 font-bold">★ {agent.rating}</td>
                  <td className="p-4 font-bold text-white">{agent.totalBookings} bookings</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(agent)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-colors ${
                        agent.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      }`}
                    >
                      {agent.status}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(agent)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-800 rounded-3xl p-6 space-y-4 border border-slate-700 text-xs text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h2 className="text-base font-bold font-heading">
                {editingAgent ? 'Edit Agent Profile' : 'Onboard Travel Agency'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Agency Name *</label>
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Contact Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Commission %</label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="approved">Approved</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
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
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
