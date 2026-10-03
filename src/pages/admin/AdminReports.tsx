import React from 'react';
import { getAllBookings, getCustomers } from '../../services/db';
import { useToast } from '../../context/ToastContext';
import { FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { showToast } = useToast();

  const exportBookingsCSV = async () => {
    try {
      const bookings = await getAllBookings();
      if (bookings.length === 0) {
        showToast('No booking records to export.', 'info');
        return;
      }

      const headers = ['Booking ID,Type,Customer Name,Email,Phone,Item Name,CheckIn,TotalPrice,PaymentMethod,PaymentStatus,BookingStatus,CreatedAt\n'];
      const rows = bookings.map((b) =>
        [
          `"${b.bookingNumber || b.id}"`,
          `"${b.type}"`,
          `"${b.customerDetails?.fullName?.replace(/"/g, '""') || ''}"`,
          `"${b.customerDetails?.email || ''}"`,
          `"${b.customerDetails?.phoneNumber || ''}"`,
          `"${b.itemName?.replace(/"/g, '""') || ''}"`,
          `"${b.checkInDate}"`,
          b.totalPrice,
          `"${b.paymentMethod}"`,
          `"${b.paymentStatus}"`,
          `"${b.bookingStatus}"`,
          `"${b.createdAt}"`
        ].join(',')
      );

      const csvContent = headers.concat(rows.join('\n')).join('');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `illusion_bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Bookings CSV exported successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to export CSV', 'error');
    }
  };

  const exportCustomersCSV = async () => {
    try {
      const customers = await getCustomers();
      const headers = ['UID,Full Name,Email,Phone,Role,Blocked,CreatedAt\n'];
      const rows = customers.map((c) =>
        [
          `"${c.uid}"`,
          `"${c.fullName?.replace(/"/g, '""') || ''}"`,
          `"${c.email || ''}"`,
          `"${c.phoneNumber || ''}"`,
          `"${c.role}"`,
          c.isBlocked ? 'Yes' : 'No',
          `"${c.createdAt}"`
        ].join(',')
      );

      const csvContent = headers.concat(rows.join('\n')).join('');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `illusion_customers_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Customers CSV exported successfully!', 'success');
    } catch {
      showToast('Failed to export CSV', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-heading">Data Exports & Reports</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Download raw transaction records, passenger manifests, and revenue spreadsheets in CSV format.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading">Bookings & Revenue Export</h3>
            <p className="text-xs text-slate-400 mt-1">
              Complete transaction log including room nights, taxes, applied coupons, customer contacts, and payment status.
            </p>
          </div>
          <button
            type="button"
            onClick={exportBookingsCSV}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Bookings CSV</span>
          </button>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading">Customer Accounts Export</h3>
            <p className="text-xs text-slate-400 mt-1">
              Active registered member profiles, contact directory, verification status, and assigned roles.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCustomersCSV}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Customers CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
