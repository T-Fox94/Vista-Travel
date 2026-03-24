import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NotificationType } from '@prisma/client';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const notifications = await db.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await db.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      title,
      message,
      fullMessage,
      relatedId,
      relatedType,
    } = body;

    const notification = await db.notification.create({
      data: {
        userId,
        type: type as NotificationType,
        title,
        message,
        fullMessage,
        relatedId,
        relatedType,
      },
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, markAllRead } = body;

    if (markAllRead && userId) {
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (notificationId) {
      await db.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');
    const userId = searchParams.get('userId');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll && userId) {
      await db.notification.deleteMany({
        where: { userId },
      });

      return NextResponse.json({
        success: true,
        message: 'All notifications deleted',
      });
    }

    if (notificationId) {
      await db.notification.delete({
        where: { id: notificationId },
      });

      return NextResponse.json({
        success: true,
        message: 'Notification deleted',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
