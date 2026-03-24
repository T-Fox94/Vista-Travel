import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/wishlist - Get user wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const wishlist = await db.wishlistItem.findMany({
      where: { userId },
      include: {
        destination: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      wishlist: wishlist.map((item) => item.destination),
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, destinationId } = body;

    if (!userId || !destinationId) {
      return NextResponse.json(
        { success: false, error: 'userId and destinationId are required' },
        { status: 400 }
      );
    }

    // Check if already in wishlist
    const existing = await db.wishlistItem.findUnique({
      where: {
        userId_destinationId: { userId, destinationId },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Already in wishlist',
        inWishlist: true,
      });
    }

    // Add to wishlist
    await db.wishlistItem.create({
      data: {
        userId,
        destinationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Added to wishlist',
      inWishlist: true,
    });
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { success: false, error: `Database error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const destinationId = searchParams.get('destinationId');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll && userId) {
      await db.wishlistItem.deleteMany({
        where: { userId },
      });

      return NextResponse.json({
        success: true,
        message: 'Wishlist cleared',
      });
    }

    if (!userId || !destinationId) {
      return NextResponse.json(
        { success: false, error: 'userId and destinationId are required' },
        { status: 400 }
      );
    }

    await db.wishlistItem.delete({
      where: {
        userId_destinationId: { userId, destinationId },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist',
      inWishlist: false,
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}

// PUT /api/wishlist - Check if in wishlist
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, destinationId } = body;

    if (!userId || !destinationId) {
      return NextResponse.json(
        { success: false, error: 'userId and destinationId are required' },
        { status: 400 }
      );
    }

    const item = await db.wishlistItem.findUnique({
      where: {
        userId_destinationId: { userId, destinationId },
      },
    });

    return NextResponse.json({
      success: true,
      inWishlist: !!item,
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check wishlist' },
      { status: 500 }
    );
  }
}
