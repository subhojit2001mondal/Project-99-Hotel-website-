import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// Customer Web App Pages
import { HomePage } from './pages/HomePage';
import { HotelListingPage } from './pages/HotelListingPage';
import { HotelDetailPage } from './pages/HotelDetailPage';
import { PackageListingPage } from './pages/PackageListingPage';
import { PackageDetailPage } from './pages/PackageDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { OffersPage } from './pages/OffersPage';
import { BookingFlowPage } from './pages/BookingFlowPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Panel Layout & Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminHotels } from './pages/admin/AdminHotels';
import { AdminPackages } from './pages/admin/AdminPackages';
import { AdminAgents } from './pages/admin/AdminAgents';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

const CustomerLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Customer Facing Web App */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/hotels" element={<HotelListingPage />} />
              <Route path="/hotels/:id" element={<HotelDetailPage />} />
              <Route path="/packages" element={<PackageListingPage />} />
              <Route path="/packages/:id" element={<PackageDetailPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/book" element={<BookingFlowPage />} />
              <Route path="/my-trips" element={<MyTripsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Management Panel */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="hotels" element={<AdminHotels />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="agents" element={<AdminAgents />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="offers" element={<AdminCoupons />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
