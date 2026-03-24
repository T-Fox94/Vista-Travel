import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const userCount = await db.user.count();
    const destinationCount = await db.destination.count();
    const airlineCount = await db.airline.count();
    const voucherCount = await db.voucher.count();

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      counts: {
        users: userCount,
        destinations: destinationCount,
        airlines: airlineCount,
        vouchers: voucherCount,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
