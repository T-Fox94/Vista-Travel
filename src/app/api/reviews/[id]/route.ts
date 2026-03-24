import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const review = await db.review.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: true,
        destination: true
      }
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("PATCH_REVIEW_ERROR", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.review.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_REVIEW_ERROR", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
