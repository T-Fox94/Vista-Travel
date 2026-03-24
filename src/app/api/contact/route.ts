import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// In-memory storage for contact messages (in production, use a database)
const contactMessages: Array<{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "unread" | "read" | "replied";
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = contactSchema.parse(body);
    
    // Create a new contact message
    const newMessage = {
      id: `MSG-${Date.now()}`,
      ...validatedData,
      timestamp: new Date().toISOString(),
      status: "unread" as const,
    };
    
    // Store the message
    contactMessages.unshift(newMessage);
    
    // In a real application, you would:
    // 1. Store in database
    // 2. Send confirmation email to the user
    // 3. Send notification to admin team
    // 4. Possibly trigger a webhook for CRM integration
    
    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: {
        id: newMessage.id,
        timestamp: newMessage.timestamp,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");
  
  let filteredMessages = [...contactMessages];
  
  if (status && ["unread", "read", "replied"].includes(status)) {
    filteredMessages = filteredMessages.filter(m => m.status === status);
  }
  
  const paginatedMessages = filteredMessages.slice(offset, offset + limit);
  
  return NextResponse.json({
    success: true,
    data: paginatedMessages,
    total: filteredMessages.length,
    limit,
    offset,
  });
}
