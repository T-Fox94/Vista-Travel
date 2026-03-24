import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/destinations/[id] - Get single destination
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const destination = await db.destination.findUnique({
            where: { id }
        });

        if (!destination) {
            return NextResponse.json(
                { success: false, error: 'Destination not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, destination });
    } catch (error) {
        console.error('Error fetching destination:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch destination' },
            { status: 500 }
        );
    }
}

// PATCH /api/destinations/[id] - Update destination
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
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
            isActive,
            childPrice,
            maxGroupSize,
            availableDates,
            transportOptions,
            accommodationOptions,
            addOns
        } = body;

        // Build update object only with provided fields
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (location !== undefined) updateData.location = location;
        if (image !== undefined) updateData.image = image;
        if (rating !== undefined) updateData.rating = rating;
        if (reviews !== undefined) updateData.reviews = reviews;
        if (price !== undefined) updateData.price = price;
        if (duration !== undefined) updateData.duration = duration;
        if (description !== undefined) updateData.description = description;
        if (mealPlan !== undefined) updateData.mealPlan = mealPlan;
        if (tags !== undefined) updateData.tags = tags;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (childPrice !== undefined) updateData.childPrice = childPrice;
        if (maxGroupSize !== undefined) updateData.maxGroupSize = maxGroupSize;
        if (availableDates !== undefined) updateData.availableDates = availableDates;
        if (transportOptions !== undefined) updateData.transportOptions = transportOptions;
        if (accommodationOptions !== undefined) updateData.accommodationOptions = accommodationOptions;
        if (addOns !== undefined) updateData.addOns = addOns;

        const destination = await db.destination.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, destination });
    } catch (error) {
        console.error('Error updating destination:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update destination' },
            { status: 500 }
        );
    }
}

// DELETE /api/destinations/[id] - Delete destination
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        await db.destination.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Destination deleted successfully' });
    } catch (error) {
        console.error('Error deleting destination:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete destination' },
            { status: 500 }
        );
    }
}
