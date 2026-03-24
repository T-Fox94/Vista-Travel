import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DiscountType, VoucherApplicableTo } from '@prisma/client';

// GET /api/vouchers - Get all vouchers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const userId = searchParams.get('userId');

    let whereClause: any = {};

    if (activeOnly) {
      whereClause.isActive = true;
      whereClause.validUntil = { gte: new Date() };
      whereClause.validFrom = { lte: new Date() };
    }

    const vouchers = await db.voucher.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    // If userId provided, get user's voucher usage status
    let userVouchers: any[] = [];
    if (userId) {
      userVouchers = await db.userVoucher.findMany({
        where: { userId },
        include: { voucher: true },
      });
    }

    return NextResponse.json({
      success: true,
      vouchers,
      userVouchers: userVouchers.length > 0 ? userVouchers : undefined,
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vouchers' },
      { status: 500 }
    );
  }
}

// POST /api/vouchers - Create new voucher (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      validFrom,
      validUntil,
      applicableTo,
      usageLimit,
    } = body;

    // Check if code already exists
    const existing = await db.voucher.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Voucher code already exists' },
        { status: 400 }
      );
    }

    const voucher = await db.voucher.create({
      data: {
        code,
        title,
        description,
        discountType: discountType as DiscountType,
        discountValue,
        minPurchase: minPurchase || 0,
        maxDiscount,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        applicableTo: applicableTo as VoucherApplicableTo,
        usageLimit,
      },
    });

    return NextResponse.json({
      success: true,
      voucher,
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create voucher' },
      { status: 500 }
    );
  }
}

// PUT /api/vouchers - Validate and apply voucher
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, amount, type } = body;

    const voucher = await db.voucher.findUnique({
      where: { code },
    });

    if (!voucher) {
      return NextResponse.json(
        { success: false, error: 'Invalid voucher code' },
        { status: 400 }
      );
    }

    // Check if voucher is active
    if (!voucher.isActive) {
      return NextResponse.json(
        { success: false, error: 'This voucher is no longer active' },
        { status: 400 }
      );
    }

    // Check dates
    const now = new Date();
    if (now < voucher.validFrom || now > voucher.validUntil) {
      return NextResponse.json(
        { success: false, error: 'This voucher has expired' },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (amount < voucher.minPurchase) {
      return NextResponse.json(
        { success: false, error: `Minimum purchase of $${voucher.minPurchase} required` },
        { status: 400 }
      );
    }

    // Check usage limit
    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'This voucher has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check if user already used this voucher
    if (userId) {
      const userUsage = await db.userVoucher.findUnique({
        where: { userId_voucherId: { userId, voucherId: voucher.id } },
      });

      if (userUsage) {
        return NextResponse.json(
          { success: false, error: 'You have already used this voucher' },
          { status: 400 }
        );
      }
    }

    // Check applicable type
    if (voucher.applicableTo !== VoucherApplicableTo.ALL) {
      const applicableMap = {
        [VoucherApplicableTo.FLIGHTS]: 'flights',
        [VoucherApplicableTo.TOURS]: 'tours',
      };
      if (applicableMap[voucher.applicableTo] !== type) {
        return NextResponse.json(
          { success: false, error: `This voucher is only valid for ${applicableMap[voucher.applicableTo]}` },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discountType === DiscountType.PERCENTAGE) {
      discount = (amount * voucher.discountValue) / 100;
      if (voucher.maxDiscount) {
        discount = Math.min(discount, voucher.maxDiscount);
      }
    } else {
      discount = voucher.discountValue;
    }

    return NextResponse.json({
      success: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        title: voucher.title,
        discount,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
      },
    });
  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate voucher' },
      { status: 500 }
    );
  }
}
