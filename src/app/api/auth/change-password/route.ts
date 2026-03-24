import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

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
  if (typeof storedHash === 'string' && storedHash.startsWith('$2')) {
    try {
      return bcrypt.compareSync(password, storedHash);
    } catch (e) {
      return false;
    }
  }
  return legacyHash(password) === storedHash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'User ID, current password, and new password are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!verifyPassword(currentPassword, user.password)) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    await db.user.update({
      where: { id: userId },
      data: {
        password: bcrypt.hashSync(newPassword, 10),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
