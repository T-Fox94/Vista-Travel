import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SupportTicketStatus } from '@prisma/client';

// GET /api/support-tickets/[id] - Get details + messages
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const ticket = await db.supportTicket.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                messages: {
                    include: {
                        sender: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
        }

        // Mark messages as read (messages not from the person fetching)
        const userId = request.nextUrl.searchParams.get('userId');
        if (userId) {
            await db.supportTicketMessage.updateMany({
                where: {
                    ticketId: id,
                    senderId: { not: userId },
                    isRead: false
                },
                data: { isRead: true }
            });
        }

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        console.error('Error fetching ticket details:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

// POST /api/support-tickets/[id]/messages - Send message
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { senderId, message } = await request.json();

        const msg = await db.supportTicketMessage.create({
            data: {
                ticketId: id,
                senderId,
                message,
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } }
            }
        });

        // Update ticket updatedAt
        await db.supportTicket.update({
            where: { id },
            data: { updatedAt: new Date() }
        });

        // Mark ticket as IN_PROGRESS if admin/staff replies
        const sender = await db.user.findUnique({ where: { id: senderId } });
        if (sender?.role === 'ADMIN' || sender?.role === 'STAFF') {
            await db.supportTicket.update({
                where: { id },
                data: { status: SupportTicketStatus.IN_PROGRESS }
            });
        }

        return NextResponse.json({ success: true, message: msg });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

// PATCH /api/support-tickets/[id] - Update status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { status } = await request.json();

        const ticket = await db.supportTicket.update({
            where: { id },
            data: {
                status: status as SupportTicketStatus,
                resolvedAt: status === SupportTicketStatus.RESOLVED ? new Date() : undefined
            }
        });

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        console.error('Error updating status:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
