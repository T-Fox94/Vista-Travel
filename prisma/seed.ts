import { PrismaClient, UserRole, BookingStatus, TicketStatus, NotificationType, DiscountType, VoucherApplicableTo, BookingType, SupportTicketStatus, TicketPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // CREATE ADMIN USER
  // ============================================
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vista.travel' },
    update: {},
    create: {
      email: 'admin@vista.travel',
      username: 'admin',
      password: 'hash_998098057_14',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      loyaltyPoints: 10000,
      totalEarned: 10000,
      isActive: true,
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  // ============================================
  // CREATE CLIENT USERS
  // ============================================
  const clients = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah@email.com' },
      update: {},
      create: {
        email: 'sarah@email.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        role: UserRole.CLIENT,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'michael@email.com' },
      update: {},
      create: {
        email: 'michael@email.com',
        password: 'password123',
        firstName: 'Michael',
        lastName: 'Brown',
        role: UserRole.CLIENT,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&h=150&auto=format&fit=crop',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'emily@email.com' },
      update: {},
      create: {
        email: 'emily@email.com',
        password: 'password123',
        firstName: 'Emily',
        lastName: 'Wilson',
        role: UserRole.CLIENT,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'john@email.com' },
      update: {},
      create: {
        email: 'john@email.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CLIENT,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&auto=format&fit=crop',
        isActive: false,
      },
    }),
    prisma.user.upsert({
      where: { email: 'alice@email.com' },
      update: {},
      create: {
        email: 'alice@email.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Smith',
        role: UserRole.CLIENT,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&h=150&auto=format&fit=crop',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created', clients.length, 'sample clients');

  // ============================================
  // CREATE AIRLINES
  // ============================================
  const airlines = await Promise.all([
    prisma.airline.upsert({
      where: { code: 'P0' },
      update: {},
      create: {
        name: 'Proflight Zambia',
        code: 'P0',
        basePrice: 185,
        isActive: true,
      },
    }),
    prisma.airline.upsert({
      where: { code: 'SA' },
      update: {},
      create: {
        name: 'South African Airways',
        code: 'SA',
        basePrice: 210,
        isActive: true,
      },
    }),
    prisma.airline.upsert({
      where: { code: 'ET' },
      update: {},
      create: {
        name: 'Ethiopian Airlines',
        code: 'ET',
        basePrice: 195,
        isActive: true,
      },
    }),
    prisma.airline.upsert({
      where: { code: 'KQ' },
      update: {},
      create: {
        name: 'Kenya Airways',
        code: 'KQ',
        basePrice: 225,
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created', airlines.length, 'airlines');

  // ============================================
  // CREATE AIRPORTS
  // ============================================
  const airports = await Promise.all([
    // Local Zambia airports
    prisma.airport.upsert({
      where: { code: 'LUN' },
      update: {},
      create: {
        code: 'LUN',
        name: 'Kenneth Kaunda International Airport',
        city: 'Lusaka',
        country: 'Zambia',
        isLocal: true,
        isActive: true,
      },
    }),
    prisma.airport.upsert({
      where: { code: 'LVI' },
      update: {},
      create: {
        code: 'LVI',
        name: 'Harry Mwanga Nkumbula International Airport',
        city: 'Livingstone',
        country: 'Zambia',
        isLocal: true,
        isActive: true,
      },
    }),
    prisma.airport.upsert({
      where: { code: 'NDLA' },
      update: {},
      create: {
        code: 'NDLA',
        name: 'Simon Mwansa Kapwepwe International Airport',
        city: 'Ndola',
        country: 'Zambia',
        isLocal: true,
        isActive: true,
      },
    }),
    // International airports
    prisma.airport.upsert({
      where: { code: 'JNB' },
      update: {},
      create: {
        code: 'JNB',
        name: 'O.R. Tambo International Airport',
        city: 'Johannesburg',
        country: 'South Africa',
        isLocal: false,
        isActive: true,
      },
    }),
    prisma.airport.upsert({
      where: { code: 'NBO' },
      update: {},
      create: {
        code: 'NBO',
        name: 'Jomo Kenyatta International Airport',
        city: 'Nairobi',
        country: 'Kenya',
        isLocal: false,
        isActive: true,
      },
    }),
    prisma.airport.upsert({
      where: { code: 'DXB' },
      update: {},
      create: {
        code: 'DXB',
        name: 'Dubai International Airport',
        city: 'Dubai',
        country: 'UAE',
        isLocal: false,
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created', airports.length, 'airports');

  // ============================================
  // CREATE DESTINATIONS
  // ============================================
  const destinations = await Promise.all([
    prisma.destination.upsert({
      where: { id: 'dest-bali' },
      update: {},
      create: {
        id: 'dest-bali',
        title: 'Bali, Indonesia',
        location: 'Indonesia',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        reviews: 120,
        price: 850,
        duration: '7 Days',
        description: 'Experience the tropical paradise with ancient temples, stunning beaches, rice terraces, and vibrant culture.',
        mealPlan: 'All Inclusive',
        tags: ['Best Seller', 'Beach'],
        isActive: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: 'dest-alps' },
      update: {},
      create: {
        id: 'dest-alps',
        title: 'Swiss Alps',
        location: 'Switzerland',
        image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        reviews: 85,
        price: 1200,
        duration: '5 Days',
        description: 'Breathtaking mountain views, world-class skiing, charming alpine villages, and luxury resorts.',
        mealPlan: 'Half Board',
        tags: ['Premium', 'Adventure'],
        isActive: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: 'dest-safari' },
      update: {},
      create: {
        id: 'dest-safari',
        title: 'Serengeti Safari',
        location: 'Tanzania',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        reviews: 42,
        price: 2400,
        duration: '10 Days',
        description: 'Witness the great migration and encounter the Big Five in their natural habitat.',
        mealPlan: 'Full Board',
        tags: ['New', 'Safari'],
        isActive: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: 'dest-maldives' },
      update: {},
      create: {
        id: 'dest-maldives',
        title: 'Maldives',
        location: 'Maldives',
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        reviews: 68,
        price: 1850,
        duration: '6 Days',
        description: 'Crystal clear waters, overwater bungalows, pristine white sand beaches.',
        mealPlan: 'All Inclusive',
        tags: ['Honeymoon', 'Luxury'],
        isActive: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: 'dest-paris' },
      update: {},
      create: {
        id: 'dest-paris',
        title: 'Paris, France',
        location: 'France',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        reviews: 156,
        price: 1450,
        duration: '5 Days',
        description: 'The city of love awaits with iconic landmarks, world-class cuisine, art museums.',
        mealPlan: 'Bed & Breakfast',
        tags: ['Romantic', 'Culture'],
        isActive: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: 'dest-tokyo' },
      update: {},
      create: {
        id: 'dest-tokyo',
        title: 'Tokyo, Japan',
        location: 'Japan',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        reviews: 94,
        price: 1680,
        duration: '8 Days',
        description: 'Experience the perfect blend of ancient traditions and cutting-edge technology.',
        mealPlan: 'Half Board',
        tags: ['Popular', 'Culture'],
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created', destinations.length, 'destinations');

  // ============================================
  // CREATE VOUCHERS
  // ============================================
  const vouchers = await Promise.all([
    prisma.voucher.upsert({
      where: { code: 'VISTA20' },
      update: {},
      create: {
        code: 'VISTA20',
        title: '20% Off Flights',
        description: 'Get 20% off your next flight booking to any destination.',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minPurchase: 100,
        maxDiscount: 100,
        validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        applicableTo: VoucherApplicableTo.FLIGHTS,
        isActive: true,
        usageLimit: 100,
      },
    }),
    prisma.voucher.upsert({
      where: { code: 'TOUR50' },
      update: {},
      create: {
        code: 'TOUR50',
        title: '$50 Off Tours',
        description: 'Save $50 on any tour package booking of $500 or more.',
        discountType: DiscountType.FIXED,
        discountValue: 50,
        minPurchase: 500,
        validFrom: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        applicableTo: VoucherApplicableTo.TOURS,
        isActive: true,
        usageLimit: 50,
      },
    }),
    prisma.voucher.upsert({
      where: { code: 'WELCOME10' },
      update: {},
      create: {
        code: 'WELCOME10',
        title: 'Welcome Bonus',
        description: '10% off your first booking as a new Vista member.',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minPurchase: 50,
        maxDiscount: 75,
        validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        applicableTo: VoucherApplicableTo.ALL,
        isActive: true,
        usageLimit: 1000,
      },
    }),
  ]);
  console.log('✅ Created', vouchers.length, 'vouchers');

  // ============================================
  // CREATE SYSTEM SETTINGS
  // ============================================
  await prisma.systemSetting.upsert({
    where: { key: 'points_per_dollar' },
    update: { value: '10' },
    create: {
      key: 'points_per_dollar',
      value: '10',
      description: 'Loyalty points earned per dollar spent',
    },
  });

  // ============================================
  // CREATE SAMPLE BOOKINGS FOR CLIENTS
  // ============================================
  const sarah = await prisma.user.findUnique({ where: { email: 'sarah@email.com' } });
  const michael = await prisma.user.findUnique({ where: { email: 'michael@email.com' } });

  if (sarah && michael) {
    await Promise.all([
      // Sarah's bookings
      prisma.booking.upsert({
        where: { bookingId: 'BK-SARAH-001' },
        update: {},
        create: {
          bookingId: 'BK-SARAH-001',
          type: BookingType.FLIGHT,
          status: BookingStatus.CONFIRMED,
          userId: sarah.id,
          totalAmount: 1250,
        },
      }),
      prisma.booking.upsert({
        where: { bookingId: 'BK-SARAH-002' },
        update: {},
        create: {
          bookingId: 'BK-SARAH-002',
          type: BookingType.TOUR,
          status: BookingStatus.COMPLETED,
          userId: sarah.id,
          totalAmount: 3270,
        },
      }),
      // Michael's bookings
      prisma.booking.upsert({
        where: { bookingId: 'BK-MICH-001' },
        update: {},
        create: {
          bookingId: 'BK-MICH-001',
          type: BookingType.TOUR,
          status: BookingStatus.CONFIRMED,
          userId: michael.id,
          totalAmount: 2890,
        },
      }),
    ]);
  }
  console.log('✅ Created sample bookings for persistence check');

  // ============================================
  // CREATE SAMPLE SUPPORT TICKETS
  // ============================================
  const tickets = await Promise.all([
    // Ticket 1: Sarah Jenkins
    prisma.supportTicket.upsert({
      where: { ticketId: 'TKT-998877' },
      update: {},
      create: {
        ticketId: 'TKT-998877',
        subject: 'New Tour Suggestion',
        status: SupportTicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        userId: clients[0].id, // Sarah
        messages: {
          create: [
            {
              senderId: clients[0].id,
              message: 'Kindly introduce a new tour please.',
            },
            {
              senderId: adminUser.id,
              message: 'Hello! Thank you for your suggestion. We will consider adding new tours.',
            },
            {
              senderId: adminUser.id,
              message: 'Test reply from admin panel',
            }
          ]
        }
      },
    }),
    // Ticket 2: Michael Brown
    prisma.supportTicket.upsert({
      where: { ticketId: 'TKT-112233' },
      update: {},
      create: {
        ticketId: 'TKT-112233',
        subject: 'Test Ticket',
        status: SupportTicketStatus.OPEN,
        priority: TicketPriority.LOW,
        userId: clients[1].id, // Michael
        messages: {
          create: [
            {
              senderId: clients[1].id,
              message: 'Admin reply from curl test',
            }
          ]
        }
      },
    }),
    // Ticket 3: Emily Wilson
    prisma.supportTicket.upsert({
      where: { ticketId: 'TKT-445566' },
      update: {},
      create: {
        ticketId: 'TKT-445566',
        subject: 'Inquiry about Bali Tour',
        status: SupportTicketStatus.IN_PROGRESS,
        priority: TicketPriority.HIGH,
        userId: clients[2].id, // Emily
        messages: {
          create: [
            {
              senderId: clients[2].id,
              message: 'Is the Bali tour available for next month?',
            },
            {
              senderId: adminUser.id,
              message: 'Yes, it is available. Would you like to proceed?',
            }
          ]
        }
      },
    }),
  ]);
  console.log('✅ Created sample support tickets');

  await prisma.systemSetting.upsert({
    where: { key: 'site_name' },
    update: { value: 'Vista Travel' },
    create: {
      key: 'site_name',
      value: 'Vista Travel',
      description: 'Website name',
    },
  });
  // Default Terms and Privacy
  await prisma.systemSetting.upsert({
    where: { key: 'terms_of_service' },
    update: {
      value: `
      <h2>Introduction</h2>
      <p>Welcome to Vista Travel. These Terms of Service govern your use of our website and services. By using our services, you agree to these terms.</p>
      <h3>Bookings</h3>
      <p>All bookings are subject to availability. Payment must be completed to confirm a booking. Cancellation and refund policies depend on the product purchased; details are shown at checkout.</p>
      <h3>User Conduct</h3>
      <p>Users agree to provide accurate information and not to misuse the platform for fraudulent activities.</p>
      <h3>Limitation of Liability</h3>
      <p>Vista Travel is not liable for events beyond our control such as force majeure or third-party provider failures.</p>
      <h3>Contact</h3>
      <p>For questions about these Terms, contact us at info@vista-travel.com.</p>
    ` },
    create: {
      key: 'terms_of_service',
      value: `
      <h2>Introduction</h2>
      <p>Welcome to Vista Travel. These Terms of Service govern your use of our website and services. By using our services, you agree to these terms.</p>
      <h3>Bookings</h3>
      <p>All bookings are subject to availability. Payment must be completed to confirm a booking. Cancellation and refund policies depend on the product purchased; details are shown at checkout.</p>
      <h3>User Conduct</h3>
      <p>Users agree to provide accurate information and not to misuse the platform for fraudulent activities.</p>
      <h3>Limitation of Liability</h3>
      <p>Vista Travel is not liable for events beyond our control such as force majeure or third-party provider failures.</p>
      <h3>Contact</h3>
      <p>For questions about these Terms, contact us at info@vista-travel.com.</p>
    `,
      description: 'Terms of Service HTML or text',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'privacy_policy' },
    update: {
      value: `
      <h2>Privacy Policy</h2>
      <p>Vista Travel collects personal information to provide and improve our services. We collect data such as name, email, phone number, and booking details.</p>
      <h3>How We Use Data</h3>
      <p>We use your data to process bookings, send confirmations, and provide customer support. We may also use anonymized data for analytics.</p>
      <h3>Sharing</h3>
      <p>We do not sell personal data. We may share information with service providers involved in fulfilling bookings (airlines, hotels) under strict confidentiality.</p>
      <h3>Contact</h3>
      <p>If you have questions about your personal data, email privacy@vista-travel.com.</p>
    ` },
    create: {
      key: 'privacy_policy',
      value: `
      <h2>Privacy Policy</h2>
      <p>Vista Travel collects personal information to provide and improve our services. We collect data such as name, email, phone number, and booking details.</p>
      <h3>How We Use Data</h3>
      <p>We use your data to process bookings, send confirmations, and provide customer support. We may also use anonymized data for analytics.</p>
      <h3>Sharing</h3>
      <p>We do not sell personal data. We may share information with service providers involved in fulfilling bookings (airlines, hotels) under strict confidentiality.</p>
      <h3>Contact</h3>
      <p>If you have questions about your personal data, email privacy@vista-travel.com.</p>
    `,
      description: 'Privacy Policy HTML or text',
    },
  });
  console.log('✅ Created system settings');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
