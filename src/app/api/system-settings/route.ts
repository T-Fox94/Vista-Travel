import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

// GET /api/system-settings?key=site_name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    }

    const setting = await db.systemSetting.findUnique({ where: { key } });

    if (!setting) {
      return NextResponse.json({ success: false, error: 'Setting not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('System settings GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch setting' }, { status: 500 });
  }
}

// PUT /api/system-settings  { userId, key, value }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, key, value } = body;

    if (!userId || !key || typeof value !== 'string') {
      return NextResponse.json({ success: false, error: 'userId, key and value are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const setting = await db.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('System settings PUT error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: `Failed to update setting: ${errorMessage}` }, { status: 500 });
  }
}
