import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BookingType, BookingStatus, TicketStatus } from '@prisma/client';

// Generate unique booking ID
function generateBookingId(type: string): string {
  const prefix = type === 'FLIGHT' ? 'ET' : 'TV';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

// Generate unique ticket number
function generateTicketNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'VST-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET /api/bookings - Get user bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as BookingStatus | null;
    const type = searchParams.get('type') as BookingType | null;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const whereClause: any = {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    };

    if (userId !== 'ALL') {
      whereClause.userId = userId;
    }

    const bookings = await db.booking.findMany({
      where: whereClause,
      include: {
        ticket: true,
        destination: {
          select: {
            id: true,
            title: true,
            location: true,
            image: true,
            duration: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      // Flight fields
      flightId,
      flightCode,
      fromAirport,
      toAirport,
      fromCity,
      toCity,
      departureDate,
      departureTime,
      passengers,
      flightClass,
      seatNumbers,
      // Tour fields
      destinationId,
      hotelName,
      roomType,
      guests,
      adults,
      children,
      idType,
      idNumber,
      transportType,
      tourDate,
      guestId,
      duration,
      includedItems,
      // Common
      totalAmount,
      passengerName,
      // New flexible tour fields
      selectedTransport,
      selectedAccommodation,
      selectedAddOnsArr,
    } = body;

    if (!userId || !type || !passengerName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bookingId = generateBookingId(type);
    const ticketNumber = generateTicketNumber();

    // Create booking with ticket in transaction
    const result = await db.$transaction(async (tx) => {
      // Create booking
      const booking = await tx.booking.create({
        data: {
          bookingId,
          type: type as BookingType,
          status: BookingStatus.CONFIRMED,
          userId,
          flightId,
          passengers: passengers || 1,
          flightClass,
          seatNumbers: seatNumbers || [],
          departureDate,
          fromAirport,
          toAirport,
          fromCity,
          toCity,
          destinationId,
          hotelName,
          roomType,
          guests,
          adults: adults || 1,
          children: children || 0,
          transportType,
          idType,
          idNumber,
          guestId,
          tourDate,
          totalAmount,
          paymentStatus: 'completed',
          confirmedAt: new Date(),
          // New flexible tour fields
          selectedTransport: selectedTransport || null,
          selectedAccommodation: selectedAccommodation || null,
          selectedAddOns: selectedAddOnsArr || null,
        },
      });

      // Create ticket
      const ticket = await tx.ticket.create({
        data: {
          ticketNumber,
          bookingId: booking.id,
          passengerName,
          fromAirport,
          toAirport,
          fromCity,
          toCity,
          flightCode,
          departureDate,
          departureTime,
          seatNumber: seatNumbers?.[0],
          flightClass,
          hotelName,
          roomType,
          guests,
          adults: adults || 1,
          children: children || 0,
          transportType,
          idType,
          idNumber,
          duration,
          includedItems: includedItems || [],
          status: TicketStatus.CONFIRMED,
          userId,
          // New flexible tour fields
          selectedTransport: selectedTransport || null,
          selectedAccommodation: selectedAccommodation || null,
          selectedAddOns: selectedAddOnsArr || null,
        },
      });

      // If voucher was provided, record usage
      if (body.voucherCode) {
        try {
          const voucherRec = await tx.voucher.findUnique({ where: { code: body.voucherCode } });
          if (voucherRec) {
            // increment usage count
            await tx.voucher.update({ where: { id: voucherRec.id }, data: { usageCount: { increment: 1 } } });
            // create userVoucher entry
            await tx.userVoucher.create({
              data: {
                userId,
                voucherId: voucherRec.id,
                status: 'used',
                usedAt: new Date(),
                usedOnBooking: booking.id,
              },
            });
          }
        } catch (e) {
          // swallow voucher recording errors but log
          console.error('Voucher recording error:', e);
        }
      }

      // Add loyalty points (10 points per dollar)
      const points = Math.floor(totalAmount * 10);
      await tx.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: { increment: points },
          totalEarned: { increment: points },
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: 'BOOKING',
          title: 'Booking Confirmed',
          message: `Your ${type === 'FLIGHT' ? 'flight' : 'tour'} booking ${bookingId} has been confirmed.`,
          fullMessage: `Your ${type === 'FLIGHT' ? 'flight' : 'tour'} booking (${bookingId}) has been confirmed successfully. ${type === 'FLIGHT' ? `Flight ${flightCode} from ${fromCity} to ${toCity}` : `Tour to ${hotelName}`} on ${departureDate || tourDate}. Your ticket number is ${ticketNumber}. Thank you for booking with Vista!`,
          relatedId: ticket.id,
          relatedType: 'ticket',
        },
      });

      return { booking, ticket };
    });

    return NextResponse.json({
      success: true,
      booking: result.booking,
      ticket: result.ticket,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings - Update booking status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status, userId } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, error: 'bookingId and status are required' },
        { status: 400 }
      );
    }

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: status as BookingStatus,
        ...(status === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
      include: { ticket: true },
    });

    // Update ticket status if cancelled
    if (status === 'CANCELLED' && booking.ticket) {
      await db.ticket.update({
        where: { id: booking.ticket.id },
        data: {
          status: TicketStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      // Create notification
      if (userId) {
        await db.notification.create({
          data: {
            userId,
            type: 'BOOKING',
            title: 'Booking Cancelled',
            message: `Your booking ${booking.bookingId} has been cancelled.`,
            relatedId: booking.ticket.id,
            relatedType: 'ticket',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings - Delete booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId is required' },
        { status: 400 }
      );
    }

    // Delete ticket first (cascade)
    await db.ticket.deleteMany({
      where: { bookingId },
    });

    // Delete booking
    await db.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
