import React, { useState, useEffect } from 'react';
import { getPlatformSettings, savePlatformSettings, getAuditLogs } from '../../services/db';
import { PlatformSettings, AuditLog } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Settings, ShieldCheck, Save, Clock, History } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [taxRatePercent, setTaxRatePercent] = useState(12);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [cancellationPolicySummary, setCancellationPolicySummary] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [s, l] = await Promise.all([getPlatformSettings(), getAuditLogs()]);
        setSettings(s);
        setLogs(l);
        if (s) {
          setDefaultCurrency(s.defaultCurrency || 'INR');
          setTaxRatePercent(s.taxRatePercent || 12);
          setContactEmail(s.contactEmail || '');
          setContactPhone(s.contactPhone || '');
          setCancellationPolicySummary(s.cancellationPolicySummary || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await savePlatformSettings({
        defaultCurrency,
        currencySymbol: defaultCurrency === 'INR' ? '₹' : '$',
        taxRatePercent,
        contactEmail,
        contactPhone,
        cancellationPolicySummary
      });
      showToast('Platform settings updated successfully!', 'success');
      const updatedLogs = await getAuditLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white font-heading">Settings & Immutable Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure platform defaults, taxation, operational contacts, and inspect security audit trails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-6">
          <div className="flex items-center gap-2 text-white font-heading font-bold text-base">
            <Settings className="w-5 h-5 text-orange-400" />
            <span>Platform Configuration</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Base Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                >
                  <option value="INR">Indian Rupee (₹ INR)</option>
                  <option value="USD">US Dollar ($ USD)</option>
                  <option value="EUR">Euro (€ EUR)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">GST Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRatePercent}
                  onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">24/7 Concierge Support Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">24/7 Helpline Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Standard Cancellation Policy Notice</label>
              <textarea
                rows={3}
                value={cancellationPolicySummary}
                onChange={(e) => setCancellationPolicySummary(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Audit Log Stream */}
        <div className="bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2 text-white font-heading font-bold text-base">
                <History className="w-5 h-5 text-sky-400" />
                <span>Administrative Audit Trail</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Immutable</span>
            </div>

            <div className="space-y-3 mt-4 max-h-[420px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No audit logs recorded yet. Changes made to catalog, bookings, and settings will stream here.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-900/60 rounded-2xl border border-slate-700/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-orange-400 font-bold">{log.action}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{log.details}</p>
                    <p className="text-[10px] text-slate-400">Admin: {log.adminEmail}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
