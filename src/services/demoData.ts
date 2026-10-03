import { Hotel, TourPackage, TravelService, Coupon, Banner, Agent, PlatformSettings } from '../types';

export const DEMO_SETTINGS: PlatformSettings = {
  id: 'platform',
  defaultCurrency: 'INR',
  currencySymbol: '₹',
  taxRatePercent: 12,
  contactEmail: 'support@illusiontravel.com',
  contactPhone: '+91 1800-456-7890',
  cancellationPolicySummary: 'Free cancellation up to 48 hours before check-in. 50% refund between 24-48 hours. Non-refundable within 24 hours.',
  termsUrl: '/terms'
};

export const DEMO_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    userId: 'agent-user-1',
    agencyName: 'Himalayan Horizons Expeditions',
    contactName: 'Vikram Negi',
    email: 'vikram@himalayanhorizons.com',
    phone: '+91 98765 43210',
    commissionRate: 10,
    status: 'approved',
    rating: 4.9,
    totalBookings: 142,
    createdAt: new Date().toISOString()
  },
  {
    id: 'agent-2',
    userId: 'agent-user-2',
    agencyName: 'Royal Rajputana Journeys',
    contactName: 'Devika Rathore',
    email: 'devika@rajputanajourneys.com',
    phone: '+91 98223 11223',
    commissionRate: 12,
    status: 'approved',
    rating: 4.8,
    totalBookings: 98,
    createdAt: new Date().toISOString()
  },
  {
    id: 'agent-3',
    userId: 'agent-user-3',
    agencyName: 'Emerald Coast & Island Escapes',
    contactName: 'Arjun Menon',
    email: 'arjun@emeraldcoast.in',
    phone: '+91 94471 22334',
    commissionRate: 10,
    status: 'approved',
    rating: 4.7,
    totalBookings: 65,
    createdAt: new Date().toISOString()
  }
];

export const DEMO_HOTELS: Hotel[] = [
  {
    id: 'hotel-1',
    name: 'The Leela Palatial Cove Resort & Spa',
    slug: 'leela-palatial-cove-goa',
    description: 'Perched along pristine white sands of Cavelossim Beach, The Leela Palatial Cove blends Portuguese architectural grandeur with warm Indian hospitality. Featuring 12-hole golf course, Ayurvedic spa sanctuaries, 5 award-winning restaurants, and tranquil private lagoons.',
    propertyType: 'resort',
    starRating: 5,
    city: 'Goa',
    address: 'Mobor Beach, Cavelossim, South Goa 403731',
    coordinates: { lat: 15.1583, lng: 73.9467 },
    amenities: ['Private Beach', 'Infinity Pool', 'Ayurvedic Spa', 'Free High-Speed WiFi', 'Fine Dining Restaurants', 'Fitness Center', 'Valet Parking', 'Cocktail Lounge', 'Kids Club'],
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    basePrice: 9500,
    policies: {
      checkIn: '14:00',
      checkOut: '11:00',
      cancellation: 'Free cancellation up to 48 hours prior to arrival',
      petsAllowed: false
    },
    isPublished: true,
    averageRating: 4.8,
    reviewsCount: 328,
    createdAt: new Date().toISOString(),
    rooms: [
      {
        id: 'room-1-1',
        hotelId: 'hotel-1',
        name: 'Lagoon Deluxe Room with Balcony',
        description: 'Spacious 580 sq ft room overlooking emerald lagoons with handcrafted teak furnishings and deep soaking marble tub.',
        capacityGuests: 2,
        bedType: '1 King Bed or 2 Twin Beds',
        pricePerNight: 9500,
        totalRooms: 12,
        amenities: ['Balcony with lagoon view', 'Marble bathroom', 'Espresso machine', 'High-speed WiFi', '4K Smart TV', 'Plush bathrobes'],
        photos: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 48h'
      },
      {
        id: 'room-1-2',
        hotelId: 'hotel-1',
        name: 'Oceanview Heritage Suite',
        description: 'Luxurious 850 sq ft suite featuring panoramic Arabian Sea views, separate living salon, personal butler service, and sunset patio.',
        capacityGuests: 3,
        bedType: '1 Super King Bed',
        pricePerNight: 16500,
        totalRooms: 6,
        amenities: ['Direct ocean views', 'Butler service', 'Living salon', 'Complimentary afternoon tea', 'Jacuzzi'],
        photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 48h'
      },
      {
        id: 'room-1-3',
        hotelId: 'hotel-1',
        name: 'Royal Presidential Pool Villa',
        description: 'Opulent 2,200 sq ft private villa with secluded plunge pool, private sundeck, dedicated chef dining pavilion, and direct private beach access.',
        capacityGuests: 4,
        bedType: '2 King Master Bedrooms',
        pricePerNight: 32000,
        totalRooms: 2,
        amenities: ['Private plunge pool', 'Dedicated private chef', 'Chauffeured airport transfer', 'Direct beach access', 'Top-shelf bar'],
        photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 7 days'
      }
    ]
  },
  {
    id: 'hotel-2',
    name: 'Rambagh Heritage Palace & Gardens',
    slug: 'rambagh-palace-jaipur',
    description: 'Originally built in 1835, the former residence of the Maharaja of Jaipur. Adorned with hand-carved marble jalis, sandstone balustrades, elaborate Mughal gardens, and peacocks strolling across manicured lawns.',
    propertyType: 'heritage',
    starRating: 5,
    city: 'Jaipur',
    address: 'Bhawani Singh Road, Rambagh, Jaipur, Rajasthan 302005',
    coordinates: { lat: 26.8979, lng: 75.8083 },
    amenities: ['Historical Palace', 'Mughal Gardens', 'Jiva Grande Spa', 'Indoor & Outdoor Heated Pools', 'Heritage Walk Tours', 'Polo Bar', 'Fine Dining', 'Free High-Speed WiFi'],
    photos: [
      'https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    basePrice: 14500,
    policies: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: 'Free cancellation up to 72 hours before check-in',
      petsAllowed: false
    },
    isPublished: true,
    averageRating: 4.9,
    reviewsCount: 412,
    createdAt: new Date().toISOString(),
    rooms: [
      {
        id: 'room-2-1',
        hotelId: 'hotel-2',
        name: 'Palace Room with Garden View',
        description: 'Authentic royal quarters with four-poster canopy bed, Rajasthani royal art motifs, and high arched ceilings overlooking gardens.',
        capacityGuests: 2,
        bedType: '1 Royal Canopy King Bed',
        pricePerNight: 14500,
        totalRooms: 10,
        amenities: ['Garden courtyard views', 'Royal antique furnishings', 'Marble bath with rain shower', 'Luxury Ayurvedic toiletries'],
        photos: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 72h'
      },
      {
        id: 'room-2-2',
        hotelId: 'hotel-2',
        name: 'Historical Maharani Suite',
        description: 'Grand 1,100 sq ft suite previously occupied by Rajput royalty. Includes antique chandeliers, crystal dining set, and marble balcony.',
        capacityGuests: 3,
        bedType: '1 Imperial King Bed',
        pricePerNight: 28000,
        totalRooms: 4,
        amenities: ['Private terrace balcony', 'Champagne welcome', 'Royal high-tea experience', 'Personal royal attendant'],
        photos: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 72h'
      }
    ]
  },
  {
    id: 'hotel-3',
    name: 'The Himalayan Cedar Mist Sanctuary',
    slug: 'himalayan-cedar-mist-manali',
    description: 'Nestled amidst towering deodar pine forests with 360-degree views of snow-draped Pir Panjal peaks. Features Scandinavian cedarwood architecture, wood-burning fireplaces, heated infinity pool, and mountain orchard dining.',
    propertyType: 'resort',
    starRating: 5,
    city: 'Manali',
    address: 'Log Huts Road, Old Manali, Himachal Pradesh 175131',
    coordinates: { lat: 32.2536, lng: 77.1762 },
    amenities: ['Snow Peak Views', 'Heated Indoor Pool', 'Fireplace in Every Room', 'Cedar Sauna & Steam', 'Mountain Bike Rentals', 'Trekking Concierge', 'Orchard Cafe', 'Free High-Speed WiFi'],
    photos: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    basePrice: 6800,
    policies: {
      checkIn: '13:00',
      checkOut: '11:00',
      cancellation: 'Free cancellation up to 48 hours before check-in',
      petsAllowed: true
    },
    isPublished: true,
    averageRating: 4.7,
    reviewsCount: 194,
    createdAt: new Date().toISOString(),
    rooms: [
      {
        id: 'room-3-1',
        hotelId: 'hotel-3',
        name: 'Valley Pine Chalet Room',
        description: 'Warm timber wood interiors, plush feather bedding, and panoramic French windows opening directly to pine forests.',
        capacityGuests: 2,
        bedType: '1 Queen Bed',
        pricePerNight: 6800,
        totalRooms: 14,
        amenities: ['Wood-burning stove', 'Pine forest view', 'Heated flooring', 'Mountain herbal teas'],
        photos: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 48h'
      },
      {
        id: 'room-3-2',
        hotelId: 'hotel-3',
        name: 'Duplex Alpine Loft Suite',
        description: 'Two-level mountain haven with mezzanine master bedroom, glass ceiling for stargazing, and private heated cedar hot tub on balcony.',
        capacityGuests: 4,
        bedType: '1 King Bed + 2 Twin Beds',
        pricePerNight: 12500,
        totalRooms: 5,
        amenities: ['Stargazing skylight', 'Outdoor private heated hot tub', 'Living fireplace lounge', 'Complimentary mulled wine'],
        photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 48h'
      }
    ]
  },
  {
    id: 'hotel-4',
    name: 'Kumarakom Serene Waters Villa & Backwaters',
    slug: 'kumarakom-serene-waters-kerala',
    description: 'Set on the banks of tranquil Vembanad Lake in Kerala. Features traditional Meenachil-style wooden heritage cottages, meandering canals, houseboat excursions, and authentic Kalaripayattu and Ayurvedic therapies.',
    propertyType: 'villa',
    starRating: 5,
    city: 'Kerala',
    address: 'Vembanad Lake Shore, Kumarakom, Kottayam, Kerala 686563',
    coordinates: { lat: 9.6175, lng: 76.4301 },
    amenities: ['Lakefront Location', 'Traditional Houseboat Cruises', 'Infinity Lotus Pool', 'Ayurvedic Wellness Sanctuary', 'Bird Sanctuary Tours', 'Seafood Grill', 'Yoga Pavilions'],
    photos: [
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    basePrice: 8200,
    policies: {
      checkIn: '14:00',
      checkOut: '11:00',
      cancellation: 'Free cancellation up to 48 hours prior',
      petsAllowed: false
    },
    isPublished: true,
    averageRating: 4.8,
    reviewsCount: 260,
    createdAt: new Date().toISOString(),
    rooms: [
      {
        id: 'room-4-1',
        hotelId: 'hotel-4',
        name: 'Heritage Canal Villa with Courtyard',
        description: 'Authentic 150-year-old Kerala woodwork villa with open-air outdoor shower, private canal verandah, and lotus pond access.',
        capacityGuests: 2,
        bedType: '1 King Bed',
        pricePerNight: 8200,
        totalRooms: 8,
        amenities: ['Open-air outdoor garden shower', 'Lake canal porch', 'Complimentary evening tea cruise', 'Yoga mat & gear'],
        photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 48h'
      },
      {
        id: 'room-4-2',
        hotelId: 'hotel-4',
        name: 'Lakeview Private Pool Pavilion',
        description: 'Exclusive waterfront sanctuary with private freshwater infinity plunge pool directly facing Vembanad Lake and sunset views.',
        capacityGuests: 3,
        bedType: '1 King Bed + 1 Daybed',
        pricePerNight: 15800,
        totalRooms: 4,
        amenities: ['Private lakefront plunge pool', 'Sun lounger deck', 'Dedicated Ayurvedic consultant', 'Breakfast on boat'],
        photos: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 48h'
      }
    ]
  },
  {
    id: 'hotel-5',
    name: 'Taj Lakefront Mirage Palace',
    slug: 'taj-lakefront-mirage-udaipur',
    description: 'Rising like a white jewel in the center of Lake Pichola. Breathtaking views of City Palace and Aravalli hills, royal royal boat arrivals, candlelit floating dinners, and regal Mewari architecture.',
    propertyType: 'heritage',
    starRating: 5,
    city: 'Udaipur',
    address: 'Lake Pichola, Old City, Udaipur, Rajasthan 313001',
    coordinates: { lat: 24.5762, lng: 73.6805 },
    amenities: ['Private Island Location', 'Lake Pichola Views', 'Boat Transfers', 'Royal Spa', 'Fine Dining Floating Pavilions', 'Heritage Cultural Performances', 'Swimming Pool'],
    photos: [
      'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: false,
    basePrice: 18500,
    policies: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: 'Free cancellation up to 72 hours prior',
      petsAllowed: false
    },
    isPublished: true,
    averageRating: 4.9,
    reviewsCount: 389,
    createdAt: new Date().toISOString(),
    rooms: [
      {
        id: 'room-5-1',
        hotelId: 'hotel-5',
        name: 'Luxury Lake View Room',
        description: 'Elegantly furnished with rich silks, ornate jharokhas windows, and direct views across the glistening waters to the City Palace.',
        capacityGuests: 2,
        bedType: '1 King Bed',
        pricePerNight: 18500,
        totalRooms: 8,
        amenities: ['Lake Pichola window seat', 'Champagne arrival by royal boat', 'Marble soaking tub', 'Bose sound system'],
        photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 72h'
      }
    ]
  },
  {
    id: 'hotel-6',
    name: 'The Marine Bay Grand Metropolis',
    slug: 'marine-bay-grand-mumbai',
    description: 'An iconic Art Deco waterfront landmark situated along Marine Drive, Queen\'s Necklace. Sweeping views of the Arabian Sea, Michelin-caliber rooftop bistro, infinity skyline pool, and premier business lounges.',
    propertyType: 'hotel',
    starRating: 5,
    city: 'Mumbai',
    address: '135 Marine Drive, Churchgate, Mumbai 400020',
    coordinates: { lat: 18.9322, lng: 72.8264 },
    amenities: ['Marine Drive Oceanfront', 'Rooftop Infinity Pool', 'Michelin-star Inspired Dining', 'Executive Business Club', 'Luxury Spa', '24/7 Butler Service', 'Valet Parking'],
    photos: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: false,
    basePrice: 11000,
    policies: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: 'Free cancellation up to 24 hours prior',
      petsAllowed: false
    },
    isPublished: true,
    averageRating: 4.6,
    reviewsCount: 275,
    createdAt: new Date().toISOString(),
    rooms: [
      {
        id: 'room-6-1',
        hotelId: 'hotel-6',
        name: 'Arabian Sea Premier Room',
        description: 'High floor modern room framing the iconic Queen\'s Necklace arc with floor-to-ceiling glass, Italian marble shower, and Nespresso bar.',
        capacityGuests: 2,
        bedType: '1 King Bed',
        pricePerNight: 11000,
        totalRooms: 15,
        amenities: ['Floor-to-ceiling ocean view', 'Work executive desk', 'Marble bathroom', 'Rooftop club access'],
        photos: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80'],
        cancellationPolicy: 'Free cancellation before 24h'
      }
    ]
  }
];

export const DEMO_PACKAGES: TourPackage[] = [
  {
    id: 'pkg-1',
    title: 'Magical Kashmir Valley: Srinagar, Gulmarg & Pahalgam',
    slug: 'magical-kashmir-valley-tour',
    destination: 'Kashmir',
    durationDays: 5,
    durationNights: 4,
    description: 'Immerse in Paradise on Earth. Cruise on Shikaras across Dal Lake, sleep on a handcrafted royal houseboat, ascend the Gulmarg Gondola to Apharwat peak, and stroll the pine valleys of Betaab and Aru in Pahalgam.',
    highlights: [
      'Overnight stay on a Luxury Heritage Houseboat on Dal Lake',
      'Phase 1 & Phase 2 Gondola Cable Car Ride in Gulmarg',
      'Pony trek through pristine Betaab Valley & Baisaran meadows',
      'Sunset Shikara ride through floating vegetable markets',
      'Authentic Kashmiri Wazwan 7-course multi-dish dinner'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Srinagar & Dal Lake Shikara Glide',
        description: 'Welcome at Srinagar Airport. Transfer to your luxury carved cedar houseboat on Dal Lake. Enjoy afternoon Kahwa tea and a 2-hour romantic sunset Shikara ride.',
        mealsIncluded: ['Dinner'],
        activities: ['Airport pickup', 'Houseboat check-in', 'Shikara cruise']
      },
      {
        day: 2,
        title: 'Srinagar to Gulmarg: Meadow of Flowers & Gondola',
        description: 'Scenic mountain drive to Gulmarg (2,730m). Board the highest cable car in Asia to Apharwat Peak for breathtaking panoramic snow vistas and skiing.',
        mealsIncluded: ['Breakfast', 'Dinner'],
        activities: ['Gulmarg Gondola Ride', 'Snow activities', 'Golf course visit']
      },
      {
        day: 3,
        title: 'Gulmarg to Pahalgam: Valley of Shepherds',
        description: 'Drive along saffron fields of Pampore and walnut orchards to Pahalgam. Check in to riverside mountain resort and explore Lidder river banks.',
        mealsIncluded: ['Breakfast', 'Dinner'],
        activities: ['Pampore saffron visit', 'River Lidder walk', 'Leisure evening']
      },
      {
        day: 4,
        title: 'Betaab Valley, Chandanwari & Aru Expedition',
        description: 'Explore breathtaking locales by local mountain jeeps: Betaab Valley named after the iconic film, pristine glacier waters of Chandanwari, and Aru village.',
        mealsIncluded: ['Breakfast', 'Dinner'],
        activities: ['Betaab valley sightseeing', 'Aru village walk', 'Pony riding']
      },
      {
        day: 5,
        title: 'Mughal Gardens & Departure from Srinagar',
        description: 'Return to Srinagar. Visit famous terraced Mughal Gardens: Shalimar Bagh and Nishat Bagh. Souvenir shopping for pashminas before airport drop.',
        mealsIncluded: ['Breakfast'],
        activities: ['Mughal gardens tour', 'Airport transfer']
      }
    ],
    inclusions: [
      '4 Nights accommodation (1N Houseboat + 1N Gulmarg + 1N Pahalgam + 1N Srinagar)',
      'Daily gourmet breakfast and chef-curated dinner',
      'Private AC Innova vehicle for all sightseeing and transfers',
      '1 Hour Shikara ride on Dal Lake',
      'Driver allowances, toll taxes, and parking fees',
      '24/7 on-ground tour coordinator support'
    ],
    exclusions: [
      'Airfare to/from Srinagar',
      'Gondola ride tickets (can be added on request)',
      'Pony rides and adventure snow sports',
      'Personal expenses, laundry, and tips',
      'Any camera/monument entrance fees'
    ],
    pricePerPerson: 18999,
    departureDates: ['2026-10-15', '2026-10-22', '2026-11-05', '2026-11-18', '2026-12-01'],
    maxGroupSize: 14,
    agentId: 'agent-1',
    agentName: 'Himalayan Horizons Expeditions',
    agentPhone: '+91 98765 43210',
    photos: [
      'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
    ],
    isPublished: true,
    rating: 4.9,
    reviewsCount: 164,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pkg-2',
    title: 'Royal Rajasthan Heritage: Jaipur, Jodhpur & Udaipur',
    slug: 'royal-rajasthan-heritage-tour',
    destination: 'Rajasthan',
    durationDays: 6,
    durationNights: 5,
    description: 'Walk in the footsteps of maharajas. Explore the Pink City forts of Jaipur, the blue alleys of Jodhpur, the golden Thar desert camps, and the romantic lake palaces of Udaipur.',
    highlights: [
      'Amber Fort elephant/jeep ascent and City Palace private tour',
      'Majestic Mehrangarh Fort towering above the Blue City',
      'Sunset boat ride on Lake Pichola in Udaipur',
      'Traditional Rajasthani folk dance and puppet show',
      'Heritage haveli boutique stays with royal hospitality'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Pink City Arrival & Chokhi Dhani Heritage Village',
        description: 'Arrive in Jaipur. Check in to your boutique heritage haveli. Evening visit to ethnic village Chokhi Dhani for cultural performances and authentic thali.',
        mealsIncluded: ['Dinner'],
        activities: ['Jaipur arrival', 'Heritage check-in', 'Cultural village evening']
      },
      {
        day: 2,
        title: 'Amber Fort, Hawa Mahal & Jantar Mantar',
        description: 'Ascend to Amber Fort with its mirror-inlaid Sheesh Mahal. Photo stop at Hawa Mahal, explore Jantar Mantar UNESCO observatory and royal bazaars.',
        mealsIncluded: ['Breakfast', 'Dinner'],
        activities: ['Amber fort tour', 'Hawa Mahal visit', 'Bazaar exploration']
      },
      {
        day: 3,
        title: 'Jaipur to Jodhpur via Ajmer & Pushkar Lake',
        description: 'Drive across the Aravalli hills with a stop at Brahma Temple and holy Pushkar Lake. Arrive in the sun-drenched Blue City of Jodhpur.',
        mealsIncluded: ['Breakfast', 'Dinner'],
        activities: ['Pushkar holy lake', 'Drive to Jodhpur', 'Blue city walk']
      },
      {
        day: 4,
        title: 'Mehrangarh Fort & Drive to Romantic Udaipur',
        description: 'Explore Mehrangarh Fort and Jaswant Thada. Scenic drive to Udaipur stopping at the intricately carved marble Ranakpur Jain temples.',
        mealsIncluded: ['Breakfast', 'Dinner'],
        activities: ['Mehrangarh fort visit', 'Ranakpur temple stop', 'Udaipur arrival']
      },
      {
        day: 5,
        title: 'Udaipur City Palace & Pichola Sunset Cruise',
        description: 'Tour the grand City Palace museum, Saheliyon-ki-Bari royal gardens, and conclude with a private luxury sunset cruise on Lake Pichola.',
        mealsIncluded: ['Breakfast', 'Dinner'],
        activities: ['City palace museum', 'Lake Pichola cruise', 'Rooftop dinner']
      },
      {
        day: 6,
        title: 'Farewell from the City of Lakes',
        description: 'Enjoy a leisurely breakfast overlooking the lake. Morning shopping for miniature paintings and silver jewelry before departure transfer.',
        mealsIncluded: ['Breakfast'],
        activities: ['Leisure morning', 'Airport/railway drop']
      }
    ],
    inclusions: [
      '5 Nights in curated 4-star and 5-star Heritage properties',
      'Daily breakfast and royal dinners included',
      'Dedicated AC chauffeur-driven vehicle throughout the tour',
      'Private boat cruise on Lake Pichola',
      'Government licensed heritage tour guides in each city',
      'All toll, fuel, interstate permit and parking fees'
    ],
    exclusions: [
      'Domestic flights/train tickets',
      'Monument entrance fees',
      'Optional activities and personal gratuities'
    ],
    pricePerPerson: 24500,
    departureDates: ['2026-10-18', '2026-11-02', '2026-11-15', '2026-12-05'],
    maxGroupSize: 12,
    agentId: 'agent-2',
    agentName: 'Royal Rajputana Journeys',
    agentPhone: '+91 98223 11223',
    photos: [
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80'
    ],
    isPublished: true,
    rating: 4.8,
    reviewsCount: 118,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pkg-3',
    title: 'Enchanting Kerala Backwaters, Tea Hills & Wildlife',
    slug: 'enchanting-kerala-backwaters-tour',
    destination: 'Kerala',
    durationDays: 5,
    durationNights: 4,
    description: 'From misty tea plantations of Munnar to elephant safaris in Periyar, culminating with an all-inclusive private luxury houseboat cruise on Alleppey backwaters.',
    highlights: [
      'Private Air-Conditioned Deluxe Houseboat cruise with chef onboard',
      'Walk through emerald tea estates and spice plantations in Munnar',
      'Periyar wildlife lake boat safari in Thekkady',
      'Traditional Kathakali classical dance and martial arts show',
      'Authentic Sadya meal served on banana leaves'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Cochin Arrival & Scenic Ascent to Munnar Hills',
        description: 'Meet at Cochin Airport. Drive through lush valleys and Cheeyappara waterfalls up to misty Munnar hills at 1,600m. Check in to plantation resort.',
        mealsIncluded: ['Dinner'],
        activities: ['Cochin pickup', 'Waterfalls stop', 'Tea estate resort check-in']
      },
      {
        day: 2,
        title: 'Munnar Tea Museum, Eravikulam & Mattupetty',
        description: 'Visit Eravikulam National Park home to the endangered Nilgiri Tahr. Explore Tata Tea Museum, Mattupetty Dam, and Echo Point.',
        mealsIncluded: ['Breakfast', 'Dinner'],
        activities: ['Eravikulam park', 'Tea museum tour', 'Boating at Mattupetty']
      },
      {
        day: 3,
        title: 'Munnar to Thekkady Spice Sanctuary',
        description: 'Winding drive to Periyar. Guided walking tour through aromatic cardamom, cinnamon, and pepper plantations. Evening Kalaripayattu martial arts.',
        mealsIncluded: ['Breakfast', 'Dinner'],
        activities: ['Spice plantation walk', 'Periyar safari', 'Kalaripayattu show']
      },
      {
        day: 4,
        title: 'Thekkady to Alleppey Private Houseboat Cruise',
        description: 'Drive to Alleppey. Board your traditional Kettuvallam houseboat by noon. Glide along palm-fringed lagoons while chef prepares fresh Karimeen fish.',
        mealsIncluded: ['Breakfast', 'Lunch', 'Dinner'],
        activities: ['Houseboat boarding', 'Backwater canal cruise', 'Sunset viewing']
      },
      {
        day: 5,
        title: 'Houseboat Check-out & Cochin Heritage Drop',
        description: 'Morning cruise before disembarkation. Brief tour of Fort Kochi Chinese fishing nets and colonial streets before transfer to Cochin Airport.',
        mealsIncluded: ['Breakfast'],
        activities: ['Morning cruise', 'Fort Kochi tour', 'Airport drop']
      }
    ],
    inclusions: [
      '4 Nights total (2N Munnar + 1N Thekkady + 1N Private Houseboat)',
      'All meals on houseboat (Breakfast, Lunch, Evening Snacks, Dinner)',
      'Daily breakfast at hotels',
      'Private air-conditioned vehicle for all transfers',
      'Guided spice plantation tour entry'
    ],
    exclusions: [
      'Air tickets to/from Kochi',
      'Personal expenses & monument entries'
    ],
    pricePerPerson: 16999,
    departureDates: ['2026-10-20', '2026-11-10', '2026-11-24', '2026-12-12'],
    maxGroupSize: 10,
    agentId: 'agent-3',
    agentName: 'Emerald Coast & Island Escapes',
    agentPhone: '+91 94471 22334',
    photos: [
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    isPublished: true,
    rating: 4.8,
    reviewsCount: 92,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pkg-4',
    title: 'Exotic Bali Tropical Bliss & Temple Trails',
    slug: 'exotic-bali-tropical-bliss-tour',
    destination: 'Bali',
    durationDays: 6,
    durationNights: 5,
    description: 'Experience Indonesia’s Island of the Gods. Pristine beaches in Seminyak, lush Ubud jungle swings, sacred Tanah Lot water temple at sunset, and luxury beach clubs.',
    highlights: [
      'Iconic Aloha Ubud Jungle Swing & Tegalalang Rice Terraces',
      'Tanah Lot sea temple sunset experience',
      'Uluwatu cliffside temple & mesmerizing Kecak fire dance',
      'Day trip to Nusa Penida island (Kelingking T-Rex Beach & Angel Billabong)',
      'Balinese floral aromatherapy massage'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Denpasar & Seminyak Sunset',
        description: 'Arrive at Ngurah Rai International Airport. Private transfer to Seminyak beachfront hotel. Unwind at famous Potato Head beach club.',
        mealsIncluded: ['Dinner'],
        activities: ['Airport greeting', 'Seminyak check-in', 'Beach sunset']
      },
      {
        day: 2,
        title: 'Ubud Cultural Heart: Monkey Forest & Rice Terraces',
        description: 'Scenic journey to Ubud. Visit sacred Monkey Forest sanctuary, iconic Tegalalang stepped rice terraces, and experience the thrilling jungle swing.',
        mealsIncluded: ['Breakfast', 'Lunch'],
        activities: ['Monkey forest', 'Jungle swing', 'Coffee tasting']
      },
      {
        day: 3,
        title: 'Kintamani Volcano & Tirta Empul Holy Water Springs',
        description: 'View active Mount Batur volcano over caldera lunch. Visit 10th-century Tirta Empul temple for a traditional Balinese water purification blessing.',
        mealsIncluded: ['Breakfast', 'Lunch', 'Dinner'],
        activities: ['Mount Batur viewpoint', 'Tirta Empul blessing', 'Art market']
      },
      {
        day: 4,
        title: 'Nusa Penida Island Adventure via Speedboat',
        description: 'Morning speedboat across Badung strait to Nusa Penida. Visit world-famous Kelingking T-Rex Cliff, Broken Beach, and crystal turquoise waters.',
        mealsIncluded: ['Breakfast', 'Lunch'],
        activities: ['Speedboat ride', 'Kelingking beach', 'Snorkeling option']
      },
      {
        day: 5,
        title: 'Tanah Lot Temple & Uluwatu Cliffside Sunset',
        description: 'Discover sea temple Tanah Lot. Afternoon drive to southern tip Uluwatu for clifftop ocean views and dramatic evening Kecak fire dance drama.',
        mealsIncluded: ['Breakfast', 'Dinner'],
        activities: ['Tanah Lot visit', 'Uluwatu temple', 'Kecak dance']
      },
      {
        day: 6,
        title: 'Leisure Shopping & Airport Departure',
        description: 'Relax with morning pool swim or souvenir shopping in Kuta before comfortable chauffeured transfer back to the airport.',
        mealsIncluded: ['Breakfast'],
        activities: ['Leisure morning', 'Airport drop']
      }
    ],
    inclusions: [
      '5 Nights in luxury 4-star boutique pool resort',
      'Daily international buffet breakfast and 4 curated dinners/lunches',
      'Return fast boat tickets to Nusa Penida island with island transport',
      'All temple entry tickets and jungle swing pass',
      'Private AC minivan with friendly English-speaking driver'
    ],
    exclusions: [
      'International flights to Denpasar (DPS)',
      'Indonesia tourist visa fees (if applicable)',
      'Water sports and travel insurance'
    ],
    pricePerPerson: 36500,
    departureDates: ['2026-10-25', '2026-11-12', '2026-12-08', '2026-12-22'],
    maxGroupSize: 16,
    agentId: 'agent-1',
    agentName: 'Himalayan Horizons Expeditions',
    agentPhone: '+91 98765 43210',
    photos: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80'
    ],
    isPublished: true,
    rating: 4.9,
    reviewsCount: 205,
    createdAt: new Date().toISOString()
  }
];

export const DEMO_SERVICES: TravelService[] = [
  {
    id: 'srv-1',
    title: 'Airport Luxury Chauffeur Sedan (Goa / Mumbai / Jaipur)',
    type: 'transfer',
    city: 'Goa',
    price: 1800,
    description: 'Punctual, sanitized premium AC sedan transfer with flight tracking, baggage assistance, chilled mineral water, and polite uniformed chauffeur.',
    duration: 'Single Trip',
    vehicleOrDetails: 'Toyota Camry / Honda City (Max 3 Guests + 3 Bags)',
    photos: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'srv-2',
    title: 'Full-Day Private Sightseeing SUV with Chauffeur',
    type: 'cab',
    city: 'Jaipur',
    price: 3200,
    description: 'Enjoy 8 hours and 80 km of flexible city sightseeing with local driver familiar with hidden photo spots, cafes, and historic monuments.',
    duration: '8 Hours (80 KM)',
    vehicleOrDetails: 'Toyota Innova Crysta (Max 6 Guests + 6 Bags)',
    photos: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'srv-3',
    title: 'Scuba Diving & Grand Island Snorkeling Cruise',
    type: 'activity',
    city: 'Goa',
    price: 2499,
    description: 'PADI-certified guided beginner scuba dive in Arabian Sea waters with underwater video recordings, dolphin sighting cruise, and beach BBQ lunch.',
    duration: '6 Hours',
    vehicleOrDetails: 'Includes Boat Cruise + Full Scuba Gear + Lunch',
    photos: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'srv-4',
    title: 'Hot Air Balloon Safari Over Pink City Forts',
    type: 'activity',
    city: 'Jaipur',
    price: 8500,
    description: 'Drift serenely above Amber Fort and Aravalli mountain ridges at sunrise with licensed international pilots followed by champagne breakfast.',
    duration: '3 Hours (60 Min Flight)',
    vehicleOrDetails: 'Sunrise Flight + Certificate + Champagne Toast',
    photos: ['https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'srv-5',
    title: 'Sunset Luxury Catamaran Cruise with Live Music',
    type: 'activity',
    city: 'Goa',
    price: 1600,
    description: 'Cruise down Mandovi River onto the Arabian Sea as the sky turns golden. Free cocktails, snacks, and acoustic saxophone melodies.',
    duration: '2 Hours',
    vehicleOrDetails: 'Double-Decker Luxury Catamaran Yacht',
    photos: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'srv-6',
    title: 'Old Delhi / Fort Kochi Street Food & Heritage Walk',
    type: 'activity',
    city: 'Mumbai',
    price: 1200,
    description: 'Curated 3-hour culinary walking expedition with food historian tasting 8+ legendary hidden dishes with safety-inspected hygiene standards.',
    duration: '3.5 Hours',
    vehicleOrDetails: 'Small Group (Max 8) + All Food Tastings Included',
    photos: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true,
    createdAt: new Date().toISOString()
  }
];

export const DEMO_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'ILLUSION500',
    discountType: 'flat',
    discountValue: 500,
    minAmount: 3000,
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    timesUsed: 142,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cpn-2',
    code: 'FIRSTTRIP',
    discountType: 'percentage',
    discountValue: 15,
    minAmount: 5000,
    maxDiscount: 2500,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    timesUsed: 89,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cpn-3',
    code: 'SUPERSTAY',
    discountType: 'percentage',
    discountValue: 20,
    minAmount: 10000,
    maxDiscount: 4000,
    expiryDate: '2026-12-31',
    usageLimit: 300,
    timesUsed: 64,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cpn-4',
    code: 'WEEKEND10',
    discountType: 'percentage',
    discountValue: 10,
    minAmount: 4000,
    maxDiscount: 1500,
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    timesUsed: 210,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const DEMO_BANNERS: Banner[] = [
  {
    id: 'bnr-1',
    title: 'Monsoon to Winter Escapes: Up to 25% Off Luxury Resorts',
    subtitle: 'Book signature stays in Goa, Udaipur, and Kerala with complimentary spa therapies & breakfast.',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80',
    link: '/hotels?featured=true',
    discountTag: 'LIMITED TIME DEAL',
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bnr-2',
    title: 'Kashmir Valley & Gulmarg Ski Packages',
    subtitle: 'All-inclusive 5-day snow wonderlands with houseboats, Gondola passes, and private chauffeurs.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
    link: '/packages/pkg-1',
    discountTag: 'BESTSELLER',
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bnr-3',
    title: 'Flat ₹500 Off with Code ILLUSION500',
    subtitle: 'Zero cancellation fees, instant confirmation, and 24/7 dedicated travel concierge.',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80',
    link: '/hotels',
    discountTag: 'COUPON AVAILABLE',
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString()
  }
];
