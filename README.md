# Illusion - Premium Hotel & Tour Booking Platform

Illusion is an enterprise-grade luxury travel, hotel, and tour reservation platform inspired by the speed and richness of MakeMyTrip and the clean step-based card booking architecture of BookMyShow.

## Tech Stack & Architecture
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Lucide Icons, Canvas Confetti.
- **Backend**: Firebase Authentication (Email/Password & Google Sign-In), Cloud Firestore (with atomic inventory transactions), Firebase Storage (with client-side image compression fallback).

---

## User Roles & RBAC
1. **`customer`**: Default role on sign-up. Can browse, filter, save to wishlist, book stays, cancel according to policy, and submit reviews for completed trips.
2. **`agent`**: Tour agency partner who can manage packages and view attributed customer bookings.
3. **`admin` / `super_admin`**: Full platform control across hotels, room inventory, agents, bookings, refunds, customers, coupons, and audit logs.

---

## How the First Super Admin is Created
- **Owner Email**: `Roysahil579@gmail.com`
- **Default Password**: `Illusio@006574`
- The Firestore security rules and authentication context automatically recognize `Roysahil579@gmail.com` and grant the `super_admin` role.
- For testing and evaluation, a **1-click Quick Login** button is embedded directly on the Sign-In modal and the `/admin` login screen to authenticate as Super Admin with zero typing required.

---

## Key Features
- **Unified Hero Search**: Instant multi-tab filtering for Hotels, Curated Tour Packages, and Chauffeured Services.
- **Hotel Catalog**: Full range slider, star rating, property type, amenities filter, list/map cards view, and skeleton loaders.
- **Hotel Detail**: Photo lightbox gallery, room categories with live availability, policies, verified reviews, and sticky booking card.
- **Tour Packages**: Day-wise expandable itineraries, inclusions & exclusions checklist, fixed departures, and agent profiles.
- **BookMyShow Style 5-Step Checkout**:
  1. *Selection Review*
  2. *Primary Guest Information*
  3. *Itemized Fare Breakdown & Live Coupon Validation* (`ILLUSION500`, `FIRSTTRIP`, `SUPERSTAY`, `WEEKEND10`)
  4. *Payment Choice*: Pay Online (demo simulation for UPI/Card/NetBanking) or Pay at Property (Zero advance required)
  5. *Celebration & Official Printable Voucher* (with printable `@media print` PDF layout)
- **Zero Double-Booking Guarantee**: Firestore transactions atomically lock inventory for reserved dates.
- **Admin Control Center (`/admin`)**:
  - Live KPI cards (Gross Revenue, Total Reservations, Occupancy %, Active Members)
  - Interactive SVG revenue growth trajectory chart & low inventory alerts
  - Complete CRUD for Hotels, Room types, Tour Packages, Agents, and Services
  - Live Booking & Refund status update console
  - Customer directory with account block/unblock
  - Marketing coupons & homepage banner management
  - CSV exports of bookings and customer accounts
  - Immutable audit logs of all administrative actions
  - One-click **"Load Demo Data"** seeder button to populate catalog in 1 second.

---

## How to Deploy
1. **Security Rules**:
   - `firestore.rules` and `storage.rules` are located in the repository root.
   - Deployed via the AI Studio Firebase tools or Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules,storage:rules
     ```
2. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```
