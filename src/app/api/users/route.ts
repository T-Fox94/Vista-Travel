import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

// GET /api/users - Get all users (staff/admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as UserRole | null;

    const users = await db.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        loyaltyPoints: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        bookings: {
          select: {
            totalAmount: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const usersWithStats = users.map(user => {
      const confirmedBookings = user.bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
      return {
        ...user,
        bookingsCount: user.bookings.length,
        totalSpent: confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        bookings: undefined // Remove raw bookings array from response
      };
    });

    return NextResponse.json({ success: true, users: usersWithStats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, isActive, avatar, role } = body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password, // In production, hash the password!
        firstName,
        lastName,
        phone,
        isActive: isActive !== undefined ? isActive : true,
        avatar,
        role: role || UserRole.CLIENT,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
