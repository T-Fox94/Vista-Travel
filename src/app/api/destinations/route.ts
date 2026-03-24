import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/destinations - Get all destinations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const activeOnly = searchParams.get('active') !== 'false';

    const destinations = await db.destination.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await db.destination.count({
      where: activeOnly ? { isActive: true } : undefined,
    });

    return NextResponse.json({
      success: true,
      destinations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

// POST /api/destinations - Create new destination (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      location,
      image,
      rating,
      reviews,
      price,
      duration,
      description,
      mealPlan,
      tags,
      childPrice,
      maxGroupSize,
      availableDates,
      transportOptions,
      accommodationOptions,
      addOns,
    } = body;

    const destination = await db.destination.create({
      data: {
        title,
        location,
        image,
        rating: rating || 4.5,
        reviews: reviews || 0,
        price,
        duration,
        description,
        mealPlan,
        tags: tags || [],
        childPrice: childPrice || 0,
        maxGroupSize: maxGroupSize || 15,
        availableDates: availableDates || [],
        transportOptions: transportOptions || [],
        accommodationOptions: accommodationOptions || [],
        addOns: addOns || [],
      },
    });

    return NextResponse.json({
      success: true,
      destination,
    });
  } catch (error) {
    console.error('Error creating destination:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create destination' },
      { status: 500 }
    );
  }
}
