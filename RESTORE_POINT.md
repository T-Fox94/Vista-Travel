# Vista Travel Platform - Restore Point v2

**Date**: 2025-03-02
**Status**: Database Integrated - Production Ready
**Version**: 0.3.0

---

## 🎯 Project Overview

Vista is a comprehensive travel and tours booking platform built with Next.js 16, featuring:
- **Google Cloud SQL PostgreSQL** database
- Real user authentication
- Flight and tour bookings
- Real-time WebSocket support
- Loyalty points system

---

## 📁 Project Structure

```
/home/z/my-project/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main application (single-page app)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── api/                  # API routes (DATABASE CONNECTED)
│   │       ├── auth/route.ts     # Login, Register, Profile
│   │       ├── bookings/route.ts # Bookings CRUD
│   │       ├── tickets/route.ts  # Tickets management
│   │       ├── wishlist/route.ts # Wishlist CRUD
│   │       ├── destinations/route.ts # Destinations
│   │       ├── vouchers/route.ts # Vouchers
│   │       ├── notifications/route.ts # Notifications
│   │       ├── users/route.ts    # User management
│   │       └── health/route.ts   # Health check
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (complete set)
│   │   └── auth/
│   │       └── AuthModal.tsx     # Authentication modal
│   ├── store/
│   │   ├── vista-store.ts        # Main application state
│   │   └── auth-store.ts         # Authentication state (DATABASE API)
│   ├── lib/
│   │   ├── db.ts                 # Prisma client (hardcoded URL)
│   │   └── utils.ts              # Utility functions
│   └── hooks/
│       ├── use-mobile.ts
│       ├── use-toast.ts
│       └── use-realtime.ts       # WebSocket hook
├── prisma/
│   ├── schema.prisma             # PostgreSQL schema (15+ models)
│   └── seed.ts                   # Database seeding script
├── mini-services/
│   └── realtime-service/         # WebSocket service
│       ├── index.ts              # Socket.io server
│       └── package.json
├── next.config.ts                # DATABASE_URL configured here
├── .env                          # Environment variables
├── package.json
├── RESTORE_POINT.md
└── worklog.md
```

---

## 🗄️ Database Configuration

### Google Cloud SQL

| Setting | Value |
|---------|-------|
| **Instance Name** | `vista-travel` |
| **Region** | `africa-south1 (Johannesburg)` |
| **Database** | `vista_travel` |
| **Host** | `34.35.76.77` |
| **Port** | `5432` |
| **User** | `vista_admin` |

### Connection String Format
```
postgresql://vista_admin:PASSWORD@34.35.76.77:5432/vista_travel?sslmode=no-verify
```

### Important: Environment Loading
The DATABASE_URL is configured in **`next.config.ts`** due to Turbopack caching issues:
```typescript
env: {
  DATABASE_URL: 'postgresql://vista_admin:ENCODED_PASSWORD@34.35.76.77:5432/vista_travel?sslmode=no-verify',
}
```

---

## 📊 Database Schema

### Core Models

```prisma
// Users & Authentication
model User {
  id, email, password, firstName, lastName, phone, avatar
  role: CLIENT | STAFF | ADMIN
  loyaltyPoints, totalEarned, totalRedeemed, memberSince
}

model Session { id, userId, token, expiresAt }

// Flights
model Airline { id, name, code, basePrice }
model Airport { id, code, name, city, country, isLocal }
model Flight { id, airline, flightNumber, from/to, times, price }

// Tours
model Destination { id, title, location, image, rating, price, duration, tags[] }

// Bookings
model Booking {
  id, bookingId, type: FLIGHT|TOUR, status
  userId, flightId?, destinationId?
  totalAmount, paymentStatus
}

model Ticket {
  id, ticketNumber, bookingId, passengerName
  flight/tour details, status: CONFIRMED|CANCELLED|USED
}

// Supporting
model Notification { id, userId, type, title, message, relatedId, relatedType }
model Voucher { id, code, discountType, discountValue, validFrom/Until }
model UserVoucher { id, userId, voucherId, status }
model WishlistItem { id, userId, destinationId }
model ContactMessage { id, name, email, subject, message }
model SystemSetting { id, key, value }
```

---

## ✅ Features Implemented

### Authentication
- ✅ User registration with password hashing
- ✅ Login with credential validation
- ✅ Profile update (name, phone, avatar)
- ✅ Session persistence (localStorage)
- ✅ Role-based access (CLIENT, STAFF, ADMIN)

### Bookings
- ✅ Create flight bookings
- ✅ Create tour bookings
- ✅ Generate unique booking IDs (ET-YYYY-XXXX for flights, TV-YYYY-XXXX for tours)
- ✅ Generate unique ticket numbers (VST-XXXXXXXX)
- ✅ Automatic loyalty points (10 per dollar)
- ✅ Booking confirmation notifications

### E-Tickets
- ✅ View all tickets
- ✅ Ticket details modal
- ✅ Download/print tickets
- ✅ Cancel tickets
- ✅ Mark as viewed

### Destinations
- ✅ Browse destinations
- ✅ View details
- ✅ Book tours
- ✅ Add to wishlist

### Notifications
- ✅ Database-backed notifications
- ✅ Expand/collapse for details
- ✅ Navigate to related items
- ✅ Mark as read/delete
- ✅ Type-based styling (booking, offer, payment, system)

### Loyalty Program
- ✅ Points earned on bookings
- ✅ 4 tiers: Bronze, Silver, Gold, Platinum
- ✅ Tier benefits display
- ✅ Progress tracking

### Vouchers
- ✅ View active vouchers
- ✅ Validate voucher codes
- ✅ Apply discounts (percentage/fixed)
- ✅ Usage tracking

### Wishlist
- ✅ Add/remove destinations
- ✅ Quick booking from wishlist
- ✅ Clear wishlist

### Real-Time (WebSocket)
- ✅ Socket.io service on port 3003
- ✅ Real-time notification support
- ✅ Booking status updates
- ✅ Staff alerts
- ✅ Chat messaging support

---

## 🔌 API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth` | GET, POST, PUT | Authentication & profile |
| `/api/bookings` | GET, POST, PUT, DELETE | Booking management |
| `/api/tickets` | GET, PUT, DELETE | Ticket management |
| `/api/destinations` | GET, POST | Destination listing |
| `/api/vouchers` | GET, POST, PUT | Voucher validation |
| `/api/notifications` | GET, POST, PUT, DELETE | Notifications |
| `/api/wishlist` | GET, POST, PUT, DELETE | Wishlist |
| `/api/users` | GET, POST | User management |
| `/api/health` | GET | Database health check |

---

## 📦 Dependencies

### Core
- `next`: ^16.1.1
- `react`: ^19.0.0
- `typescript`: ^5
- `tailwindcss`: ^4

### Database
- `@prisma/client`: ^6.11.1
- `prisma`: ^6.11.1

### UI
- `shadcn/ui` components (complete set)
- `lucide-react`: ^0.525.0
- `framer-motion`: ^12.23.2
- `sonner`: ^2.0.6

### State
- `zustand`: ^5.0.6

### Real-Time
- `socket.io`: ^4.7.0 (server)
- `socket.io-client`: ^4.8.3 (client)

---

## 🚀 Commands

```bash
# Development
bun run dev

# Database
bun run db:generate   # Generate Prisma client
bun run db:push       # Push schema changes
bun run db:seed       # Seed initial data

# WebSocket Service
cd mini-services/realtime-service && bun run dev

# Lint
bun run lint
```

---

## 📋 Seeded Data

| Data Type | Count | Details |
|-----------|-------|---------|
| Admin User | 1 | admin@vista.travel |
| Airlines | 4 | Proflight, SAA, Ethiopian, Kenya Airways |
| Airports | 6 | LUN, LVI, NDLA (local), JNB, NBO, DXB (intl) |
| Destinations | 6 | Bali, Alps, Serengeti, Maldives, Paris, Tokyo |
| Vouchers | 3 | VISTA20, TOUR50, WELCOME10 |

---

## ⚠️ Known Limitations

1. **Password Hashing**: Simple hash for demo - use bcrypt in production
2. **Session Management**: Basic localStorage - use JWT/NextAuth for production
3. **SSL**: Disabled for development (`sslmode=no-verify`)
4. **Network Access**: Open to all IPs (`0.0.0.0/0`) - restrict in production

---

## 📝 Restore Instructions

To restore to this point:

1. Ensure all files in `/src/app/api/` exist
2. Verify `prisma/schema.prisma` has all models
3. Check `next.config.ts` has DATABASE_URL
4. Verify `src/lib/db.ts` has hardcoded connection string
5. Run `bun install`
6. Run `bun run db:generate`
7. Run `bun run dev`

### Critical Files Checklist
- [ ] `src/app/page.tsx` - Main application
- [ ] `src/store/auth-store.ts` - Auth with API calls
- [ ] `src/store/vista-store.ts` - App state
- [ ] `src/lib/db.ts` - Prisma client with URL
- [ ] `prisma/schema.prisma` - Database schema
- [ ] `next.config.ts` - DATABASE_URL env
- [ ] All API routes in `src/app/api/`

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | Initial | UI/Feature complete demo |
| 0.2.0 | Session 1 | Notification improvements |
| 0.3.0 | Session 2-3 | Google Cloud SQL integration |

---

**End of Restore Point v2**
