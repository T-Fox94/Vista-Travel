import { create } from "zustand";

export type PageType = "home" | "flights" | "destinations" | "contact" | "tickets" | "admin" | "terms" | "privacy";
export type AdminSection = "dashboard" | "bookings" | "messages" | "tickets" | "notifications" | "settings" | "profile" | "wishlist" | "analytics" | "calendar" | "flight_bookings" | "support_tickets" | "customers" | "reviews" | "tours_packages" | "legal_documents" | "vouchers";
export type TicketFilter = "all" | "flight" | "tour" | "voucher";
export type TripType = "oneWay" | "roundTrip" | "multiCity";
export type FlightType = "local" | "international";
export type NotificationType = "booking" | "offer" | "payment" | "system";

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  status: "active" | "expired";
  applicableTo: "flights" | "tours" | "all";
  applicableToUser?: string; // Target specific user ID
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  color: string;
  icon: string;
}

export interface LoyaltyRewards {
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  currentTier: LoyaltyTier;
  nextTier?: LoyaltyTier;
  pointsToNextTier: number;
  pointsPerDollar: number;
  memberSince: string;
}

export interface TourOption {
  label: string;
  price: number;
}

export interface AccommodationOption {
  label: string;
  priceAdjustment: number;
}

export interface Destination {
  id: string;
  title: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  price: number; // Base Adult Price
  childPrice: number;
  duration: string;
  description: string;
  tags: string[];
  mealPlan: string;
  hasRooms?: boolean;
  maxGroupSize: number;
  availableDates: string[];
  transportOptions: TourOption[];
  accommodationOptions: AccommodationOption[];
  addOns: TourOption[];
}

export interface Flight {
  id: string;
  airline: string;
  code: string;
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  price: number;
  stops: number;
}

export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  type: "flight" | "tour" | "voucher";
  bookingId: string;
  passengerName: string;
  from?: string;
  to?: string;
  fromCity?: string;
  toCity?: string;
  flightCode?: string;
  date: string;
  time?: string;
  seat?: string;
  flightClass?: string;
  hotel?: string;
  room?: string;
  guests?: string;
  duration?: string;
  included?: string[];
  totalPaid: number;
  status: "confirmed" | "pending" | "cancelled";
  isViewed?: boolean;
  selectedTransport?: TourOption;
  selectedAccommodation?: AccommodationOption;
  selectedAddOns?: TourOption[];
}

export interface LegalSection {
  title: string;
  content: string;
}

export interface LegalDocuments {
  privacyPolicy: LegalSection[];
  termsOfService: LegalSection[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  fullMessage?: string;
  timestamp: string;
  isRead: boolean;
  relatedId?: string; // ID of related item (ticket, voucher, etc.)
  relatedType?: "ticket" | "voucher" | "destination";
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
    location?: string;
  };
  destinationId?: string;
  destination?: {
    title: string;
    location: string;
  };
  createdAt: string;
}

interface VistaState {
  currentPage: PageType;
  adminSection: AdminSection;
  ticketFilter: TicketFilter;
  tripType: TripType;
  flightType: FlightType;
  selectedDestination: Destination | null;
  selectedFlight: Flight | null;
  contactMessages: ContactMessage[];
  tickets: Ticket[];
  notifications: Notification[];
  unreadNotificationCount: number;
  unreadSupportTicketCount: number;
  vouchers: Voucher[];
  wishlist: Destination[];
  reviews: Review[];
  legalDocuments: LegalDocuments;

  // Review actions
  setReviews: (reviews: Review[]) => void;
  addReview: (review: Review) => void;
  updateReviewStatus: (id: string, status: "APPROVED" | "REJECTED") => void;
  deleteReview: (id: string) => void;

  setPage: (page: PageType) => void;
  setAdminSection: (section: AdminSection) => void;
  setTicketFilter: (filter: TicketFilter) => void;
  setTripType: (type: TripType) => void;
  setFlightType: (type: FlightType) => void;
  setSelectedDestination: (destination: Destination | null) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  addContactMessage: (message: ContactMessage) => void;
  addTicket: (ticket: Ticket) => void;
  removeTicket: (id: string) => void;
  updateTicketStatus: (id: string, status: "confirmed" | "pending" | "cancelled") => void;
  markTicketViewed: (id: string) => void;
  markAllTicketsViewed: () => void;
  markNotificationRead: (id: string) => void;
  markNotificationsReadByRelatedId: (relatedId: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  // Voucher actions
  addVoucher: (voucher: Voucher) => void;
  updateVoucherStatus: (id: string, status: "active" | "expired") => void;
  removeVoucher: (id: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => void;
  setUnreadSupportTicketCount: (count: number) => void;
  addToWishlist: (destination: Destination) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (destination: Destination) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  setWishlist: (destinations: Destination[]) => void;
  // Legal docs
  fetchLegalDocuments: () => Promise<void>;
  saveLegalDocuments: (type: "privacy" | "terms", sections: LegalSection[], userId: string) => Promise<void>;
  updateLegalSection: (type: "privacy" | "terms", sections: LegalSection[]) => void;
  // Currency
  currency: "USD" | "EUR" | "GBP" | "ZMW" | "ZAR";
  setCurrency: (c: "USD" | "EUR" | "GBP" | "ZMW" | "ZAR") => void;
  // Convert helpers (base amounts stored as USD)
  convertFromUSD: (amount: number) => number;
  convertToUSD: (amount: number) => number;
}

export const useVistaStore = create<VistaState>((set, get) => ({
  currentPage: "home",
  adminSection: "dashboard",
  ticketFilter: "all",
  tripType: "oneWay",
  flightType: "local",
  selectedDestination: null,
  selectedFlight: null,
  contactMessages: [],
  tickets: [
    {
      id: "1",
      type: "flight",
      bookingId: "ET-2024-001",
      passengerName: "John Doe",
      from: "LUN",
      to: "LVI",
      fromCity: "Lusaka",
      toCity: "Livingstone",
      flightCode: "P0 101",
      date: "Jan 25, 2024",
      time: "08:00 AM",
      seat: "12A",
      flightClass: "Economy",
      totalPaid: 210,
      status: "confirmed",
    },
    {
      id: "2",
      type: "flight",
      bookingId: "ET-2024-002",
      passengerName: "Sarah Jenkins",
      from: "LUN",
      to: "JNB",
      fromCity: "Lusaka",
      toCity: "Johannesburg",
      flightCode: "SA 402",
      date: "Feb 10, 2024",
      time: "14:30 PM",
      seat: "8C",
      flightClass: "Business",
      totalPaid: 345,
      status: "confirmed",
    },
    {
      id: "3",
      type: "tour",
      bookingId: "TV-2024-001",
      passengerName: "Michael Brown",
      hotel: "Grand Bali Resort",
      room: "Deluxe Ocean View",
      guests: "2 Adults",
      date: "Mar 15, 2024",
      duration: "7 Days / 6 Nights",
      included: ["Accommodation", "Daily Breakfast", "Airport Transfer", "City Tour"],
      totalPaid: 1700,
      status: "confirmed",
    },
    {
      id: "4",
      type: "tour",
      bookingId: "TV-2024-002",
      passengerName: "Emily Wilson",
      hotel: "Alpine Grand Hotel",
      room: "Mountain Suite",
      guests: "2 Adults, 1 Child",
      date: "Apr 05, 2024",
      duration: "5 Days / 4 Nights",
      included: ["Accommodation", "Half Board", "Ski Pass", "Guide"],
      totalPaid: 3600,
      status: "confirmed",
    },
  ],
  notifications: [
    {
      id: "n1",
      type: "booking",
      title: "Booking Confirmed",
      message: "Your flight to Livingstone has been confirmed.",
      fullMessage: "Your flight booking (ET-2024-001) from Lusaka to Livingstone on Jan 25, 2024 at 08:00 AM has been confirmed. Your seat is 12A in Economy class. Please arrive at the airport at least 2 hours before departure. E-ticket has been sent to your email.",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      isRead: false,
      relatedId: "1",
      relatedType: "ticket",
    },
    {
      id: "n2",
      type: "offer",
      title: "Special Offer",
      message: "Get 20% off on your next flight to Johannesburg.",
      fullMessage: "Exclusive offer! Get 20% off your next flight booking to Johannesburg. Use code VISTA20 at checkout. Valid for bookings made within the next 30 days. Minimum purchase of $100 required. Maximum discount of $100.",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isRead: false,
      relatedId: "v1",
      relatedType: "voucher",
    },
    {
      id: "n3",
      type: "payment",
      title: "Payment Received",
      message: "Payment of $210 for your tour package has been processed.",
      fullMessage: "Your payment of $210.00 for the Bali Tour Package has been successfully processed. Transaction ID: TXN-2024-78542. The payment was charged to your card ending in 4242. Your booking is now confirmed.",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      relatedId: "1",
      relatedType: "ticket",
    },
    {
      id: "n4",
      type: "system",
      title: "Welcome to Vista",
      message: "Thank you for joining Vista! Start exploring amazing destinations.",
      fullMessage: "Welcome to Vista! We're thrilled to have you on board. Start exploring our curated destinations, book flights, and discover amazing travel experiences. As a welcome gift, use code WELCOME10 for 10% off your first booking!",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      relatedId: "v3",
      relatedType: "voucher",
    },
  ],
  unreadNotificationCount: 3,
  unreadSupportTicketCount: 0,
  vouchers: [
    {
      id: "v1",
      code: "VISTA20",
      title: "20% Off Flights",
      description: "Get 20% off your next flight booking to any destination.",
      discountType: "percentage",
      discountValue: 20,
      minPurchase: 100,
      maxDiscount: 100,
      validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      applicableTo: "flights",
    },
    {
      id: "v2",
      code: "TOUR50",
      title: "$50 Off Tours",
      description: "Save $50 on any tour package booking of $500 or more.",
      discountType: "fixed",
      discountValue: 50,
      minPurchase: 500,
      validFrom: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      applicableTo: "tours",
    },
    {
      id: "v3",
      code: "WELCOME10",
      title: "Welcome Bonus",
      description: "10% off your first booking as a new Vista member.",
      discountType: "percentage",
      discountValue: 10,
      minPurchase: 50,
      maxDiscount: 75,
      validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      applicableTo: "all",
    },
    {
      id: "v4",
      code: "SUMMER25",
      title: "Summer Special",
      description: "25% off all summer destinations. Limited time offer!",
      discountType: "percentage",
      discountValue: 25,
      minPurchase: 200,
      maxDiscount: 200,
      validFrom: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "expired",
      applicableTo: "all",
    },
  ],
  wishlist: [],
  reviews: [],

  setPage: (page) => {
    set({ currentPage: page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  setAdminSection: (section) => set({ adminSection: section }),
  setTicketFilter: (filter) => set({ ticketFilter: filter }),
  setTripType: (type) => set({ tripType: type }),
  setFlightType: (type) => set({ flightType: type }),
  setSelectedDestination: (destination) => set({ selectedDestination: destination }),
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  addContactMessage: (message) => set((state) => ({
    contactMessages: [message, ...state.contactMessages]
  })),
  addTicket: (ticket) => set((state) => ({
    tickets: [ticket, ...state.tickets],
  })),
  removeTicket: (id) => set((state) => ({
    tickets: state.tickets.filter(t => t.id !== id),
  })),
  updateTicketStatus: (id, status) => set((state) => ({
    tickets: state.tickets.map(t => t.id === id ? { ...t, status } : t),
  })),
  markTicketViewed: (id) => set((state) => ({
    tickets: state.tickets.map(t => t.id === id ? { ...t, isViewed: true } : t),
  })),
  markAllTicketsViewed: () => set((state) => ({
    tickets: state.tickets.map(t => ({ ...t, isViewed: true })),
  })),
  markNotificationRead: (id) => set((state) => {
    const notifications = state.notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    return {
      notifications,
      unreadNotificationCount: notifications.filter(n => !n.isRead).length
    };
  }),
  markNotificationsReadByRelatedId: (relatedId) => set((state) => {
    const notifications = state.notifications.map(n =>
      n.relatedId === relatedId ? { ...n, isRead: true } : n
    );
    return {
      notifications,
      unreadNotificationCount: notifications.filter(n => !n.isRead).length
    };
  }),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadNotificationCount: 0
  })),
  deleteNotification: (id) => set((state) => {
    const notifications = state.notifications.filter(n => n.id !== id);
    return {
      notifications,
      unreadNotificationCount: notifications.filter(n => !n.isRead).length
    };
  }),
  deleteAllNotifications: () => set({
    notifications: [],
    unreadNotificationCount: 0
  }),
  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        ...notification,
        id: `n${Date.now()}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      },
      ...state.notifications,
    ],
    unreadNotificationCount: state.unreadNotificationCount + 1,
  })),
  // Voucher actions
  addVoucher: (voucher) => set((state) => ({
    vouchers: [...state.vouchers, voucher],
  })),
  updateVoucherStatus: (id, status) => set((state) => ({
    vouchers: state.vouchers.map(v => v.id === id ? { ...v, status } : v),
  })),
  removeVoucher: (id) => set((state) => ({
    vouchers: state.vouchers.filter(v => v.id !== id),
  })),
  setUnreadSupportTicketCount: (count) => set({ unreadSupportTicketCount: count }),
  addToWishlist: (destination) => set((state) => {
    if (state.wishlist.find(d => d.id === destination.id)) {
      return state; // Already in wishlist
    }
    return { wishlist: [destination, ...state.wishlist] };
  }),
  removeFromWishlist: (id) => set((state) => ({
    wishlist: state.wishlist.filter(d => d.id !== id),
  })),
  toggleWishlist: (destination) => set((state) => {
    const exists = state.wishlist.find(d => d.id === destination.id);
    if (exists) {
      return { wishlist: state.wishlist.filter(d => d.id !== destination.id) };
    }
    return { wishlist: [destination, ...state.wishlist] };
  }),
  isInWishlist: (id) => {
    const state = get();
    return state.wishlist.some(d => d.id === id);
  },
  clearWishlist: () => set({ wishlist: [] }),
  setWishlist: (destinations) => set({ wishlist: destinations }),
  
  // Review actions
  setReviews: (reviews) => set({ reviews }),
  addReview: (review) => set((state) => ({ reviews: [review, ...state.reviews] })),
  updateReviewStatus: (id, status) => set((state) => ({
    reviews: state.reviews.map(r => r.id === id ? { ...r, status } : r)
  })),
  deleteReview: (id) => set((state) => ({
    reviews: state.reviews.filter(r => r.id !== id)
  })),

  // Legal doc defaults
  legalDocuments: {
    privacyPolicy: [
      { title: 'Introduction', content: 'Vista Travel ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our travel services.' },
      { title: 'Information We Collect', content: 'We may collect information about you in various ways, including your name, email address, and payment information during the booking process.' }
    ],
    termsOfService: [
      { title: 'Agreement to Terms', content: 'By accessing or using our services, you agree to be bound by these terms. If you do not agree to all of the terms and conditions, then you may not access the website or use any services.' }
    ]
  },
  fetchLegalDocuments: async () => {
    try {
      const privacyRes = await fetch('/api/system-settings?key=legal_privacy');
      const termsRes = await fetch('/api/system-settings?key=legal_terms');
      
      const privacyData = await privacyRes.json();
      const termsData = await termsRes.json();
      
      const legalDocs = { ...get().legalDocuments };
      
      if (privacyData.success && privacyData.setting) {
        legalDocs.privacyPolicy = JSON.parse(privacyData.setting.value);
      }
      
      if (termsData.success && termsData.setting) {
        legalDocs.termsOfService = JSON.parse(termsData.setting.value);
      }
      
      set({ legalDocuments: legalDocs });
    } catch (error) {
      console.error('Failed to fetch legal documents:', error);
    }
  },
  saveLegalDocuments: async (type, sections, userId) => {
    try {
      const key = type === 'privacy' ? 'legal_privacy' : 'legal_terms';
      const res = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          key,
          value: JSON.stringify(sections)
        })
      });
      
      if (res.ok) {
        set((state) => ({
          legalDocuments: {
            ...state.legalDocuments,
            [type === 'privacy' ? 'privacyPolicy' : 'termsOfService']: sections
          }
        }));
      } else {
        const errorData = await res.json();
        const errorMessage = errorData.error || res.statusText;
        console.error(`API Error saving legal documents: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to save legal documents:', error);
      throw error;
    }
  },
  updateLegalSection: (type, sections) => set((state) => ({
    legalDocuments: {
      ...state.legalDocuments,
      [type === 'privacy' ? 'privacyPolicy' : 'termsOfService']: sections
    }
  })),
  // Currency defaults and helpers
  currency: "USD",
  setCurrency: (c) => set({ currency: c }),
  // Rates: 1 USD equals X units of target currency
  convertFromUSD: (amount) => {
    const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, ZMW: 18.5, ZAR: 18.0 };
    const c = get().currency || 'USD';
    return Math.max(0, +(amount * (rates[c] ?? 1)).toFixed(2));
  },
  convertToUSD: (amount) => {
    const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, ZMW: 18.5, ZAR: 18.0 };
    const c = get().currency || 'USD';
    const rate = rates[c] ?? 1;
    return Math.max(0, +(amount / rate).toFixed(2));
  },
}));

// Loyalty Tiers Configuration
export const loyaltyTiers: LoyaltyTier[] = [
  {
    id: "bronze",
    name: "Bronze",
    minPoints: 0,
    maxPoints: 999,
    benefits: ["1x points on all bookings", "Birthday bonus"],
    color: "#CD7F32",
    icon: "🥉",
  },
  {
    id: "silver",
    name: "Silver",
    minPoints: 1000,
    maxPoints: 4999,
    benefits: ["1.5x points on all bookings", "Priority support", "5% off all flights", "Birthday bonus"],
    color: "#C0C0C0",
    icon: "🥈",
  },
  {
    id: "gold",
    name: "Gold",
    minPoints: 5000,
    maxPoints: 14999,
    benefits: ["2x points on all bookings", "Priority support", "10% off all bookings", "Free lounge access", "Birthday bonus"],
    color: "#FFD700",
    icon: "🥇",
  },
  {
    id: "platinum",
    name: "Platinum",
    minPoints: 15000,
    maxPoints: 999999,
    benefits: ["3x points on all bookings", "24/7 VIP support", "15% off all bookings", "Free lounge access", "Free seat selection", "Birthday bonus"],
    color: "#E5E4E2",
    icon: "💎",
  },
];

// Helper function to get loyalty tier
export function getLoyaltyTier(points: number): LoyaltyTier {
  for (let i = loyaltyTiers.length - 1; i >= 0; i--) {
    if (points >= loyaltyTiers[i].minPoints) {
      return loyaltyTiers[i];
    }
  }
  return loyaltyTiers[0];
}

// Helper function to get next tier
export function getNextTier(currentPoints: number): LoyaltyTier | undefined {
  for (const tier of loyaltyTiers) {
    if (tier.minPoints > currentPoints) {
      return tier;
    }
  }
  return undefined;
}
