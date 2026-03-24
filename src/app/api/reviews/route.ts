import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    
    const where = status ? { status } : {};

    const reviews = await db.review.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        destination: {
          select: {
            title: true,
            location: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("GET_REVIEWS_ERROR", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rating, title, content, userId, destinationId } = body;

    if (!rating || !title || !content || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        rating,
        title,
        content,
        userId,
        destinationId,
        status: "PENDING"
      },
      include: {
        user: true,
        destination: true
      }
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("POST_REVIEW_ERROR", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
