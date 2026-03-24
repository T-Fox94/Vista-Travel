import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TicketStatus } from '@prisma/client';

// GET /api/tickets - Get user tickets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as TicketStatus | null;
    const unviewedOnly = searchParams.get('unviewed') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const tickets = await db.ticket.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
        ...(unviewedOnly ? { isViewed: false } : {}),
      },
      include: {
        booking: {
          select: {
            bookingId: true,
            type: true,
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Count unviewed
    const unviewedCount = tickets.filter((t) => !t.isViewed && t.status !== 'CANCELLED').length;

    return NextResponse.json({
      success: true,
      tickets,
      unviewedCount,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// PUT /api/tickets - Update ticket
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, isViewed, status, markAllViewed, userId } = body;

    // Mark all viewed
    if (markAllViewed && userId) {
      await db.ticket.updateMany({
        where: { userId, isViewed: false },
        data: { isViewed: true },
      });

      return NextResponse.json({
        success: true,
        message: 'All tickets marked as viewed',
      });
    }

    // Update single ticket
    if (ticketId) {
      const updateData: any = {};

      if (isViewed !== undefined) {
        updateData.isViewed = isViewed;
      }

      if (status) {
        updateData.status = status as TicketStatus;
        if (status === 'CANCELLED') {
          updateData.cancelledAt = new Date();
        }
        if (status === 'USED') {
          updateData.usedAt = new Date();
        }
      }

      const ticket = await db.ticket.update({
        where: { id: ticketId },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        ticket,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets - Delete ticket
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'ticketId is required' },
        { status: 400 }
      );
    }

    await db.ticket.delete({
      where: { id: ticketId },
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
