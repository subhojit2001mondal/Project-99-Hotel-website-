export type UserRole = 'customer' | 'agent' | 'admin' | 'super_admin';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  photoURL?: string;
  isBlocked?: boolean;
  savedTravelers?: SavedTraveler[];
  createdAt: string;
  updatedAt?: string;
}

export interface SavedTraveler {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  idType: 'Aadhaar' | 'Passport' | 'Driving License' | 'Voter ID';
  idNumber: string;
}

export type PropertyType = 'hotel' | 'resort' | 'villa' | 'heritage' | 'apartment';

export interface HotelRoom {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  capacityGuests: number;
  bedType: string;
  pricePerNight: number;
  totalRooms: number;
  amenities: string[];
  photos: string[];
  cancellationPolicy: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug?: string;
  description: string;
  propertyType: PropertyType;
  starRating: number;
  city: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  photos: string[];
  featured: boolean;
  basePrice: number;
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    petsAllowed: boolean;
  };
  agentId?: string;
  isPublished: boolean;
  rooms?: HotelRoom[];
  reviewsCount?: number;
  averageRating?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RoomInventory {
  id: string;
  hotelId: string;
  roomId: string;
  date: string; // YYYY-MM-DD
  bookedCount: number;
  totalRooms: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  mealsIncluded?: string[];
  activities?: string[];
}

export interface TourPackage {
  id: string;
  title: string;
  slug?: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  description: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  pricePerPerson: number;
  departureDates: string[];
  maxGroupSize: number;
  agentId: string;
  agentName?: string;
  agentPhone?: string;
  photos: string[];
  isPublished: boolean;
  rating: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Agent {
  id: string;
  userId: string;
  agencyName: string;
  contactName: string;
  email: string;
  phone: string;
  commissionRate: number; // e.g. 10 for 10%
  status: 'pending' | 'approved' | 'suspended';
  rating: number;
  totalBookings: number;
  createdAt: string;
}

export type ServiceType = 'cab' | 'activity' | 'transfer';

export interface TravelService {
  id: string;
  title: string;
  type: ServiceType;
  city: string;
  price: number;
  description: string;
  duration?: string;
  vehicleOrDetails?: string;
  photos: string[];
  isAvailable: boolean;
  createdAt: string;
}

export type BookingType = 'hotel' | 'package' | 'service';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'pay_at_hotel' | 'refunded';
export type PaymentMethod = 'online' | 'pay_at_hotel';

export interface CustomerDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  idType?: string;
  idNumber?: string;
  specialRequests?: string;
  savedTravelersCount?: number;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  type: BookingType;
  userId: string;
  customerDetails: CustomerDetails;
  itemId: string;
  itemName: string;
  itemDetails?: {
    city?: string;
    roomId?: string;
    roomName?: string;
    photo?: string;
    nights?: number;
    destination?: string;
    departureDate?: string;
    address?: string;
    cancellationPolicy?: string;
  };
  checkInDate: string;
  checkOutDate?: string;
  guestsCount: number;
  roomCount?: number;
  totalPrice: number;
  basePrice: number;
  taxes: number;
  discount: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  cancellationDetails?: {
    cancelledAt: string;
    refundAmount: number;
    reason: string;
    refundStatus: 'processed' | 'pending';
  };
  agentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  discountTag?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  targetType: 'hotel' | 'package';
  targetId: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'hotel' | 'package';
  itemTitle: string;
  itemCity: string;
  itemPrice: number;
  itemPhoto: string;
  itemRating: number;
  addedAt: string;
}

export interface PlatformSettings {
  id: string;
  defaultCurrency: string;
  currencySymbol: string;
  taxRatePercent: number;
  contactEmail: string;
  contactPhone: string;
  cancellationPolicySummary: string;
  termsUrl: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}
