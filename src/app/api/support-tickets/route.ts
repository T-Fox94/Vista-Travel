import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SupportTicketStatus, TicketPriority } from '@prisma/client';

// GET /api/support-tickets - Get all tickets (admin) or user's tickets (client)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const role = searchParams.get('role');

        const where: any = {};
        if (role !== 'ADMIN' && role !== 'STAFF' && userId) {
            where.userId = userId;
        }

        const tickets = await db.supportTicket.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    }
                },
                _count: {
                    select: { messages: true }
                }
            },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json({ success: true, tickets });
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch support tickets' },
            { status: 500 }
        );
    }
}

// POST /api/support-tickets - Create new ticket
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, subject, priority, message } = body;

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        // Generate ticket ID e.g. TKT-123456
        const ticketIdStr = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

        const ticket = await db.supportTicket.create({
            data: {
                ticketId: ticketIdStr,
                userId,
                subject,
                priority: priority || TicketPriority.LOW,
                status: SupportTicketStatus.OPEN,
                messages: {
                    create: {
                        senderId: userId,
                        message: message,
                    }
                }
            },
            include: {
                messages: true,
            }
        });

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create support ticket' },
            { status: 500 }
        );
    }
}
