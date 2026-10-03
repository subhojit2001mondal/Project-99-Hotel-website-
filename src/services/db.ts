import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  Hotel,
  HotelRoom,
  TourPackage,
  TravelService,
  Booking,
  Coupon,
  Banner,
  Review,
  WishlistItem,
  PlatformSettings,
  Agent,
  AuditLog,
  UserProfile
} from '../types';
import {
  DEMO_HOTELS,
  DEMO_PACKAGES,
  DEMO_SERVICES,
  DEMO_COUPONS,
  DEMO_BANNERS,
  DEMO_AGENTS,
  DEMO_SETTINGS
} from './demoData';

// Helper to log administrative actions
export async function logAdminAction(action: string, entityType: string, entityId: string, details: string) {
  try {
    const logRef = doc(collection(db, 'auditLogs'));
    await setDoc(logRef, {
      id: logRef.id,
      adminId: auth.currentUser?.uid || 'system',
      adminEmail: auth.currentUser?.email || 'admin@illusion.com',
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to write audit log:', err);
  }
}

// -------------------------------------------------------------
// ONE-CLICK DEMO DATA SEEDER
// -------------------------------------------------------------
export async function seedDemoData(force = false): Promise<{ success: boolean; message: string }> {
  try {
    const hotelsSnap = await getDocs(collection(db, 'hotels'));
    if (!hotelsSnap.empty && !force) {
      return { success: true, message: 'Catalog already populated with hotels and packages.' };
    }

    const batch = writeBatch(db);

    // 1. Seed Settings
    const settingsRef = doc(db, 'settings', 'platform');
    batch.set(settingsRef, DEMO_SETTINGS);

    // 2. Seed Agents
    for (const agent of DEMO_AGENTS) {
      const agentRef = doc(db, 'agents', agent.id);
      batch.set(agentRef, agent);
    }

    // 3. Seed Hotels and their Rooms
    for (const hotel of DEMO_HOTELS) {
      const hotelRef = doc(db, 'hotels', hotel.id);
      const { rooms, ...hotelData } = hotel;
      batch.set(hotelRef, hotelData);

      if (rooms && rooms.length > 0) {
        for (const room of rooms) {
          const roomRef = doc(db, 'hotels', hotel.id, 'rooms', room.id);
          batch.set(roomRef, room);
        }
      }
    }

    // 4. Seed Tour Packages
    for (const pkg of DEMO_PACKAGES) {
      const pkgRef = doc(db, 'packages', pkg.id);
      batch.set(pkgRef, pkg);
    }

    // 5. Seed Services
    for (const srv of DEMO_SERVICES) {
      const srvRef = doc(db, 'services', srv.id);
      batch.set(srvRef, srv);
    }

    // 6. Seed Coupons
    for (const cpn of DEMO_COUPONS) {
      const cpnRef = doc(db, 'coupons', cpn.id);
      batch.set(cpnRef, cpn);
    }

    // 7. Seed Banners
    for (const banner of DEMO_BANNERS) {
      const bannerRef = doc(db, 'banners', banner.id);
      batch.set(bannerRef, banner);
    }

    await batch.commit();

    await logAdminAction('SEED_DEMO_DATA', 'SYSTEM', 'ALL', 'Populated initial demo catalog');

    return { success: true, message: 'Successfully seeded Illusion demo catalog!' };
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to seed database' };
  }
}

// -------------------------------------------------------------
// HOTELS & ROOMS
// -------------------------------------------------------------
export async function getHotels(): Promise<Hotel[]> {
  try {
    const snap = await getDocs(collection(db, 'hotels'));
    if (snap.empty) {
      return DEMO_HOTELS; // fallback to in-memory demo if not yet seeded
    }
    const hotels: Hotel[] = [];
    for (const d of snap.docs) {
      const data = d.data() as Hotel;
      // Also fetch rooms for this hotel
      try {
        const roomsSnap = await getDocs(collection(db, 'hotels', d.id, 'rooms'));
        const rooms = roomsSnap.docs.map((rd) => rd.data() as HotelRoom);
        hotels.push({ ...data, id: d.id, rooms });
      } catch {
        hotels.push({ ...data, id: d.id, rooms: [] });
      }
    }
    return hotels;
  } catch (error) {
    console.warn('getHotels error, using fallback demo:', error);
    return DEMO_HOTELS;
  }
}

export async function getHotelById(id: string): Promise<Hotel | null> {
  try {
    const docRef = doc(db, 'hotels', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return DEMO_HOTELS.find((h) => h.id === id) || null;
    }
    const hotelData = snap.data() as Hotel;
    const roomsSnap = await getDocs(collection(db, 'hotels', id, 'rooms'));
    const rooms = roomsSnap.docs.map((rd) => rd.data() as HotelRoom);
    return { ...hotelData, id: snap.id, rooms };
  } catch (error) {
    console.warn('getHotelById fallback:', error);
    return DEMO_HOTELS.find((h) => h.id === id) || null;
  }
}

export async function saveHotel(hotel: Partial<Hotel> & { id?: string }): Promise<string> {
  try {
    const hotelId = hotel.id || doc(collection(db, 'hotels')).id;
    const hotelRef = doc(db, 'hotels', hotelId);
    const { rooms, ...hotelData } = hotel;

    await setDoc(
      hotelRef,
      {
        ...hotelData,
        id: hotelId,
        updatedAt: new Date().toISOString(),
        createdAt: hotel.createdAt || new Date().toISOString()
      },
      { merge: true }
    );

    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        const roomId = room.id || doc(collection(db, 'hotels', hotelId, 'rooms')).id;
        const roomRef = doc(db, 'hotels', hotelId, 'rooms', roomId);
        await setDoc(roomRef, { ...room, id: roomId, hotelId }, { merge: true });
      }
    }

    await logAdminAction('SAVE_HOTEL', 'HOTEL', hotelId, `Saved hotel ${hotel.name}`);
    return hotelId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `hotels/${hotel.id || 'new'}`);
  }
}

export async function deleteHotel(hotelId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'hotels', hotelId));
    await logAdminAction('DELETE_HOTEL', 'HOTEL', hotelId, `Deleted hotel ${hotelId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `hotels/${hotelId}`);
  }
}

// -------------------------------------------------------------
// TOUR PACKAGES
// -------------------------------------------------------------
export async function getPackages(): Promise<TourPackage[]> {
  try {
    const snap = await getDocs(collection(db, 'packages'));
    if (snap.empty) {
      return DEMO_PACKAGES;
    }
    return snap.docs.map((d) => ({ ...(d.data() as TourPackage), id: d.id }));
  } catch (error) {
    console.warn('getPackages error, using fallback demo:', error);
    return DEMO_PACKAGES;
  }
}

export async function getPackageById(id: string): Promise<TourPackage | null> {
  try {
    const docRef = doc(db, 'packages', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return DEMO_PACKAGES.find((p) => p.id === id) || null;
    }
    return { ...(snap.data() as TourPackage), id: snap.id };
  } catch (error) {
    console.warn('getPackageById fallback:', error);
    return DEMO_PACKAGES.find((p) => p.id === id) || null;
  }
}

export async function savePackage(pkg: Partial<TourPackage> & { id?: string }): Promise<string> {
  try {
    const pkgId = pkg.id || doc(collection(db, 'packages')).id;
    const pkgRef = doc(db, 'packages', pkgId);
    await setDoc(
      pkgRef,
      {
        ...pkg,
        id: pkgId,
        updatedAt: new Date().toISOString(),
        createdAt: pkg.createdAt || new Date().toISOString()
      },
      { merge: true }
    );
    await logAdminAction('SAVE_PACKAGE', 'PACKAGE', pkgId, `Saved package ${pkg.title}`);
    return pkgId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `packages/${pkg.id || 'new'}`);
  }
}

export async function deletePackage(pkgId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'packages', pkgId));
    await logAdminAction('DELETE_PACKAGE', 'PACKAGE', pkgId, `Deleted package ${pkgId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `packages/${pkgId}`);
  }
}

// -------------------------------------------------------------
// SERVICES
// -------------------------------------------------------------
export async function getServices(): Promise<TravelService[]> {
  try {
    const snap = await getDocs(collection(db, 'services'));
    if (snap.empty) {
      return DEMO_SERVICES;
    }
    return snap.docs.map((d) => ({ ...(d.data() as TravelService), id: d.id }));
  } catch (error) {
    console.warn('getServices error, using fallback demo:', error);
    return DEMO_SERVICES;
  }
}

export async function saveService(service: Partial<TravelService> & { id?: string }): Promise<string> {
  try {
    const serviceId = service.id || doc(collection(db, 'services')).id;
    const srvRef = doc(db, 'services', serviceId);
    await setDoc(
      srvRef,
      {
        ...service,
        id: serviceId,
        createdAt: service.createdAt || new Date().toISOString()
      },
      { merge: true }
    );
    await logAdminAction('SAVE_SERVICE', 'SERVICE', serviceId, `Saved service ${service.title}`);
    return serviceId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `services/${service.id || 'new'}`);
  }
}

export async function deleteService(serviceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'services', serviceId));
    await logAdminAction('DELETE_SERVICE', 'SERVICE', serviceId, `Deleted service ${serviceId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `services/${serviceId}`);
  }
}

// -------------------------------------------------------------
// COUPONS
// -------------------------------------------------------------
export async function getCoupons(): Promise<Coupon[]> {
  try {
    const snap = await getDocs(collection(db, 'coupons'));
    if (snap.empty) {
      return DEMO_COUPONS;
    }
    return snap.docs.map((d) => ({ ...(d.data() as Coupon), id: d.id }));
  } catch (error) {
    return DEMO_COUPONS;
  }
}

export async function saveCoupon(coupon: Partial<Coupon> & { id?: string }): Promise<string> {
  try {
    const cpnId = coupon.id || doc(collection(db, 'coupons')).id;
    const cpnRef = doc(db, 'coupons', cpnId);
    await setDoc(
      cpnRef,
      {
        ...coupon,
        id: cpnId,
        createdAt: coupon.createdAt || new Date().toISOString()
      },
      { merge: true }
    );
    await logAdminAction('SAVE_COUPON', 'COUPON', cpnId, `Saved coupon ${coupon.code}`);
    return cpnId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `coupons/${coupon.id || 'new'}`);
  }
}

export async function deleteCoupon(couponId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'coupons', couponId));
    await logAdminAction('DELETE_COUPON', 'COUPON', couponId, `Deleted coupon ${couponId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `coupons/${couponId}`);
  }
}

export function evaluateCouponDiscount(
  coupon: Coupon,
  subtotal: number
): { valid: boolean; discount: number; message: string } {
  if (!coupon.isActive) {
    return { valid: false, discount: 0, message: 'This coupon is no longer active.' };
  }
  if (new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, discount: 0, message: 'This coupon has expired.' };
  }
  if (coupon.usageLimit > 0 && coupon.timesUsed >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: 'This coupon limit has been reached.' };
  }
  if (subtotal < coupon.minAmount) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum booking amount of ₹${coupon.minAmount.toLocaleString('en-IN')} required for this coupon.`
    };
  }

  let discount = 0;
  if (coupon.discountType === 'flat') {
    discount = coupon.discountValue;
  } else {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  return { valid: true, discount, message: `Coupon ${coupon.code} applied successfully!` };
}

// -------------------------------------------------------------
// BANNERS
// -------------------------------------------------------------
export async function getBanners(): Promise<Banner[]> {
  try {
    const snap = await getDocs(collection(db, 'banners'));
    if (snap.empty) {
      return DEMO_BANNERS;
    }
    return snap.docs.map((d) => ({ ...(d.data() as Banner), id: d.id }));
  } catch (error) {
    return DEMO_BANNERS;
  }
}

export async function saveBanner(banner: Partial<Banner> & { id?: string }): Promise<string> {
  try {
    const bannerId = banner.id || doc(collection(db, 'banners')).id;
    const bannerRef = doc(db, 'banners', bannerId);
    await setDoc(
      bannerRef,
      {
        ...banner,
        id: bannerId,
        createdAt: banner.createdAt || new Date().toISOString()
      },
      { merge: true }
    );
    return bannerId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `banners/${banner.id || 'new'}`);
  }
}

// -------------------------------------------------------------
// BOOKINGS & INVENTORY TRANSACTIONS
// -------------------------------------------------------------
/**
 * Create booking with atomic transaction on inventory to prevent double-booking.
 */
export async function createBookingWithInventoryLock(
  bookingData: Omit<Booking, 'id' | 'createdAt'>
): Promise<Booking> {
  const bookingRef = doc(collection(db, 'bookings'));
  const bookingId = bookingRef.id;

  try {
    // Collect all inventory date items to inspect
    interface InventoryCheckItem {
      invRef: any;
      invId: string;
      dateStr: string;
      exists: boolean;
      bookedCount: number;
      totalRooms: number;
    }

    const inventoryItems: InventoryCheckItem[] = [];

    if (
      bookingData.type === 'hotel' &&
      bookingData.itemDetails?.roomId &&
      bookingData.checkInDate &&
      bookingData.roomCount
    ) {
      const hotelId = bookingData.itemId;
      const roomId = bookingData.itemDetails.roomId;
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = bookingData.checkOutDate
        ? new Date(bookingData.checkOutDate)
        : new Date(checkIn.getTime() + 86400000);

      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const invId = `${hotelId}_${roomId}_${dateStr}`;
        const invRef = doc(db, 'roomInventory', invId);
        inventoryItems.push({
          invRef,
          invId,
          dateStr,
          exists: false,
          bookedCount: 0,
          totalRooms: 10
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Pre-query coupon doc reference outside the transaction
    let couponDocRef: any = null;
    let couponTimesUsed = 0;
    if (bookingData.couponCode) {
      try {
        const cpnQuery = query(collection(db, 'coupons'), where('code', '==', bookingData.couponCode));
        const cpnDocs = await getDocs(cpnQuery);
        if (!cpnDocs.empty) {
          couponDocRef = cpnDocs.docs[0].ref;
          couponTimesUsed = cpnDocs.docs[0].data().timesUsed || 0;
        }
      } catch (cpnErr) {
        console.warn('Coupon pre-query warning:', cpnErr);
      }
    }

    await runTransaction(db, async (transaction) => {
      // -------------------------------------------------------------
      // PHASE 1: ALL READS MUST OCCUR BEFORE ANY WRITES
      // -------------------------------------------------------------
      for (const item of inventoryItems) {
        const invDoc = await transaction.get(item.invRef);
        if (invDoc.exists()) {
          const data = invDoc.data() as any;
          item.exists = true;
          item.bookedCount = data?.bookedCount || 0;
          item.totalRooms = data?.totalRooms || 10;
        } else {
          item.exists = false;
          item.bookedCount = 0;
          item.totalRooms = 10;
        }

        if (item.bookedCount + (bookingData.roomCount || 1) > item.totalRooms) {
          throw new Error(`Sorry, selected room type is sold out for date ${item.dateStr}!`);
        }
      }

      if (couponDocRef) {
        const cpnSnap = await transaction.get(couponDocRef);
        if (cpnSnap.exists()) {
          const cpnData = cpnSnap.data() as any;
          couponTimesUsed = cpnData?.timesUsed || 0;
        }
      }

      // -------------------------------------------------------------
      // PHASE 2: ALL WRITES AFTER READS (NO READS AFTER ANY WRITES)
      // -------------------------------------------------------------
      for (const item of inventoryItems) {
        if (item.exists) {
          transaction.update(item.invRef, {
            bookedCount: item.bookedCount + (bookingData.roomCount || 1)
          });
        } else {
          transaction.set(item.invRef, {
            id: item.invId,
            hotelId: bookingData.itemId,
            roomId: bookingData.itemDetails?.roomId,
            date: item.dateStr,
            bookedCount: bookingData.roomCount || 1,
            totalRooms: item.totalRooms
          });
        }
      }

      if (couponDocRef) {
        transaction.update(couponDocRef, {
          timesUsed: couponTimesUsed + 1
        });
      }

      const finalBooking: Booking = {
        ...bookingData,
        id: bookingId,
        createdAt: new Date().toISOString()
      };

      transaction.set(bookingRef, finalBooking);
    });

    return {
      ...bookingData,
      id: bookingId,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Booking transaction failed:', error);
    handleFirestoreError(error, OperationType.WRITE, `bookings/${bookingId}`);
  }
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const q = query(collection(db, 'bookings'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Booking), id: d.id }));
  } catch (error) {
    // If composite index is needed or permission, try without orderBy
    try {
      const qFallback = query(collection(db, 'bookings'), where('userId', '==', userId));
      const snapFallback = await getDocs(qFallback);
      const list = snapFallback.docs.map((d) => ({ ...(d.data() as Booking), id: d.id }));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (innerError) {
      console.warn('getUserBookings error:', innerError);
      return [];
    }
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const snap = await getDocs(collection(db, 'bookings'));
    return snap.docs.map((d) => ({ ...(d.data() as Booking), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'bookings');
  }
}

export async function cancelBooking(
  bookingId: string,
  reason: string
): Promise<{ success: boolean; refundAmount: number; message: string }> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const snap = await getDoc(bookingRef);
    if (!snap.exists()) {
      throw new Error('Booking not found');
    }
    const booking = snap.data() as Booking;

    if (booking.bookingStatus === 'cancelled') {
      return { success: false, refundAmount: 0, message: 'Booking is already cancelled.' };
    }

    // Calculate refund based on 48h policy
    let refundAmount = 0;
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    const hoursDiff = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (booking.paymentMethod === 'pay_at_hotel') {
      refundAmount = 0; // No money paid upfront
    } else {
      if (hoursDiff >= 48) {
        refundAmount = booking.totalPrice; // Full refund
      } else if (hoursDiff >= 24) {
        refundAmount = Math.round(booking.totalPrice * 0.5); // 50% refund
      } else {
        refundAmount = 0; // Non refundable within 24h
      }
    }

    const cancellationDetails = {
      cancelledAt: new Date().toISOString(),
      refundAmount,
      reason,
      refundStatus: (refundAmount > 0 ? 'processed' : 'processed') as 'processed'
    };

    await updateDoc(bookingRef, {
      bookingStatus: 'cancelled',
      cancellationDetails,
      updatedAt: new Date().toISOString()
    });

    await logAdminAction(
      'CANCEL_BOOKING',
      'BOOKING',
      bookingId,
      `Cancelled booking ${booking.bookingNumber}. Refund: ₹${refundAmount}`
    );

    return {
      success: true,
      refundAmount,
      message: `Booking cancelled successfully. Refund of ₹${refundAmount.toLocaleString('en-IN')} has been initiated.`
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

export async function updateBookingStatus(
  bookingId: string,
  bookingStatus: Booking['bookingStatus'],
  paymentStatus?: Booking['paymentStatus']
): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const payload: Partial<Booking> = {
      bookingStatus,
      updatedAt: new Date().toISOString()
    };
    if (paymentStatus) {
      payload.paymentStatus = paymentStatus;
    }
    await updateDoc(bookingRef, payload);
    await logAdminAction('UPDATE_BOOKING_STATUS', 'BOOKING', bookingId, `Status updated to ${bookingStatus}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

// -------------------------------------------------------------
// WISHLIST
// -------------------------------------------------------------
export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  try {
    const snap = await getDocs(query(collection(db, 'wishlists'), where('userId', '==', userId)));
    return snap.docs.map((d) => ({ ...(d.data() as WishlistItem), id: d.id }));
  } catch (error) {
    console.warn('getWishlist fallback to local storage:', error);
    const local = localStorage.getItem(`illusion_wishlist_${userId}`);
    return local ? JSON.parse(local) : [];
  }
}

export async function toggleWishlist(
  userId: string,
  item: Omit<WishlistItem, 'id' | 'userId' | 'addedAt'>
): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'wishlists'),
      where('userId', '==', userId),
      where('itemId', '==', item.itemId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      await deleteDoc(snap.docs[0].ref);
      return false; // Removed
    } else {
      const wishRef = doc(collection(db, 'wishlists'));
      await setDoc(wishRef, {
        ...item,
        id: wishRef.id,
        userId,
        addedAt: new Date().toISOString()
      });
      return true; // Added
    }
  } catch (error) {
    console.warn('toggleWishlist cloud failed, persisting to local storage');
    const key = `illusion_wishlist_${userId}`;
    const existing: WishlistItem[] = JSON.parse(localStorage.getItem(key) || '[]');
    const index = existing.findIndex((w) => w.itemId === item.itemId);
    if (index >= 0) {
      existing.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(existing));
      return false;
    } else {
      existing.push({
        ...item,
        id: `wish_${Date.now()}`,
        userId,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(existing));
      return true;
    }
  }
}

// -------------------------------------------------------------
// REVIEWS
// -------------------------------------------------------------
export async function submitReview(review: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<string> {
  try {
    const revRef = doc(collection(db, 'reviews'));
    const newReview: Review = {
      ...review,
      id: revRef.id,
      status: 'approved', // default approved or for moderation
      createdAt: new Date().toISOString()
    };
    await setDoc(revRef, newReview);
    return revRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reviews');
  }
}

export async function getReviewsForTarget(targetId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('targetId', '==', targetId),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Review), id: d.id }));
  } catch {
    return [];
  }
}

export async function getAllReviews(): Promise<Review[]> {
  try {
    const snap = await getDocs(collection(db, 'reviews'));
    return snap.docs.map((d) => ({ ...(d.data() as Review), id: d.id }));
  } catch (error) {
    return [];
  }
}

export async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<void> {
  try {
    await updateDoc(doc(db, 'reviews', reviewId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
  }
}

// -------------------------------------------------------------
// AGENTS & CUSTOMERS
// -------------------------------------------------------------
export async function getAgents(): Promise<Agent[]> {
  try {
    const snap = await getDocs(collection(db, 'agents'));
    if (snap.empty) {
      return DEMO_AGENTS;
    }
    return snap.docs.map((d) => ({ ...(d.data() as Agent), id: d.id }));
  } catch {
    return DEMO_AGENTS;
  }
}

export async function saveAgent(agent: Partial<Agent> & { id?: string }): Promise<string> {
  try {
    const agentId = agent.id || doc(collection(db, 'agents')).id;
    await setDoc(
      doc(db, 'agents', agentId),
      {
        ...agent,
        id: agentId,
        createdAt: agent.createdAt || new Date().toISOString()
      },
      { merge: true }
    );
    await logAdminAction('SAVE_AGENT', 'AGENT', agentId, `Updated agent ${agent.agencyName}`);
    return agentId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `agents/${agent.id || 'new'}`);
  }
}

export async function getCustomers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => ({ ...(d.data() as UserProfile), uid: d.id }));
  } catch (error) {
    return [];
  }
}

export async function toggleCustomerBlock(userId: string, isBlocked: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), { isBlocked });
    await logAdminAction('CUSTOMER_STATUS', 'USER', userId, `User block state set to ${isBlocked}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

// -------------------------------------------------------------
// SETTINGS & AUDIT LOGS
// -------------------------------------------------------------
export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'platform'));
    if (snap.exists()) {
      return snap.data() as PlatformSettings;
    }
    return DEMO_SETTINGS;
  } catch {
    return DEMO_SETTINGS;
  }
}

export async function savePlatformSettings(settings: Partial<PlatformSettings>): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'platform'), settings, { merge: true });
    await logAdminAction('UPDATE_SETTINGS', 'SETTINGS', 'platform', 'Updated platform configuration');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/platform');
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const snap = await getDocs(collection(db, 'auditLogs'));
    const logs = snap.docs.map((d) => ({ ...(d.data() as AuditLog), id: d.id }));
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch {
    return [];
  }
}
