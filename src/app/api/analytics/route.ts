import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Lightweight server-side logging for analytics events — expand as needed
    console.log('ANALYTICS EVENT:', body);

    // In a real system you'd enqueue this to a tracking system or DB.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record analytics' }, { status: 500 });
  }
}
