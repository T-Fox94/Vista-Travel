import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users/[id] - Get single user details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const user = await db.user.findUnique({
            where: { id },
            include: {
                bookings: {
                    select: {
                        id: true,
                        bookingId: true,
                        type: true,
                        status: true,
                        totalAmount: true,
                        createdAt: true,
                    }
                },
                tickets: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        
        // Destructure all possible fields including isVerified
        const { firstName, lastName, email, phone, role, isActive, avatar, isVerified } = body;

        // Build a clean data object with only defined fields
        const updateData: any = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (role !== undefined) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (isVerified !== undefined) updateData.isVerified = isVerified;

        const user = await db.user.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        await db.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
