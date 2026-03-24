import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Simple fallback hash used previously for demo accounts
function legacyHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hash_${Math.abs(hash)}_${password.length}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  // If stored hash looks like a bcrypt hash, use bcrypt
  if (typeof storedHash === 'string' && storedHash.startsWith('$2')) {
    try {
      return bcrypt.compareSync(password, storedHash);
    } catch (e) {
      return false;
    }
  }

  // Fallback to legacy demo hash
  return legacyHash(password) === storedHash;
}

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, username, password, firstName, lastName, phone } = body;

    // LOGIN
    if (action === 'login') {
      const identifier = email || username;
      if (!identifier || !password) {
        return NextResponse.json(
          { success: false, error: 'Email/username and password are required' },
          { status: 400 }
        );
      }

      // Determine whether identifier is an email or username
      let user = null;
      if (identifier.includes && identifier.includes('@')) {
        user = await db.user.findUnique({ where: { email: identifier } });
      } else {
        user = await db.user.findUnique({ where: { username: identifier } });
      }

      if (!user || !verifyPassword(password, user.password)) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, error: 'Account is deactivated' },
          { status: 403 }
        );
      }

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          loyaltyPoints: user.loyaltyPoints,
          totalEarned: user.totalEarned,
          memberSince: user.memberSince,
          isActive: user.isActive,
          isVerified: user.isVerified,
        },
      });
    }

    // REGISTER
    if (action === 'register') {
      if (!email || !password || !firstName || !lastName) {
        return NextResponse.json(
          { success: false, error: 'All fields are required' },
          { status: 400 }
        );
      }

      // Check if user exists by email or username
      const existingUser = await db.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'User with this email or username already exists' },
          { status: 400 }
        );
      }

      // Create user
      const user = await db.user.create({
        data: {
          email,
          username,
          password: bcrypt.hashSync(password, 10),
          firstName,
          lastName,
          phone,
          role: UserRole.CLIENT,
        },
      });

      // Create welcome notification
      await db.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Welcome to Vista!',
          message: 'Thank you for joining Vista! Start exploring amazing destinations.',
          fullMessage: 'Welcome to Vista! We\'re thrilled to have you on board. Start exploring our curated destinations, book flights, and discover amazing travel experiences. As a welcome gift, use code WELCOME10 for 10% off your first booking!',
          relatedId: 'v3', // WELCOME10 voucher
          relatedType: 'voucher',
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
          loyaltyPoints: user.loyaltyPoints,
          memberSince: user.memberSince,
          isActive: user.isActive,
          isVerified: user.isVerified,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// GET /api/auth - Get current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        loyaltyPoints: true,
        totalEarned: true,
        totalRedeemed: true,
        memberSince: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

// PUT /api/auth - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, firstName, lastName, phone, avatar, currentPassword, newPassword, isVerified } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    // If changing password, verify current password
    if (currentPassword && newPassword) {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user || !verifyPassword(currentPassword, user.password)) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      await db.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phone,
          avatar,
          isVerified,
          password: bcrypt.hashSync(newPassword, 10),
        },
      });
    } else {
      await db.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phone,
          avatar,
          isVerified,
        },
      });
    }

    const updatedUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        loyaltyPoints: true,
        isActive: true,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
