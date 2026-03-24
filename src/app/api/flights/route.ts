import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const flightSearchSchema = z.object({
  from: z.string().min(3, "Origin airport code is required"),
  to: z.string().min(3, "Destination airport code is required"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  passengers: z.number().min(1).max(9).default(1),
  tripType: z.enum(["oneWay", "roundTrip", "multiCity"]).default("oneWay"),
  returnDate: z.string().optional(),
  flightType: z.enum(["local", "international"]).default("local"),
});

// Mock flight data generator
function generateFlights(from: string, to: string, date: string, flightType: string) {
  const airlines = [
    { name: "Proflight Zambia", code: "P0", color: "emerald", basePrice: 185 },
    { name: "South African Airways", code: "SA", color: "blue", basePrice: 210 },
    { name: "Ethiopian Airlines", code: "ET", color: "orange", basePrice: 195 },
    { name: "Kenya Airways", code: "KQ", color: "red", basePrice: 225 },
  ];

  return airlines.map((airline, index) => {
    const departHour = 8 + index * 3;
    const arriveHour = departHour + 2;
    const priceMultiplier = flightType === "international" ? 1.5 : 1;
    
    return {
      id: `FL-${Date.now()}-${index}`,
      airline: airline.name,
      code: `${airline.code}${100 + index}`,
      from,
      to,
      departureDate: date,
      departTime: `${departHour.toString().padStart(2, "0")}:00`,
      arriveTime: `${arriveHour.toString().padStart(2, "0")}:30`,
      duration: "2h 30m",
      price: Math.round(airline.basePrice * priceMultiplier),
      currency: "USD",
      seats: Math.floor(Math.random() * 50) + 10,
      stops: flightType === "international" && index > 2 ? 1 : 0,
      aircraft: index % 2 === 0 ? "Boeing 737" : "Airbus A320",
      amenities: ["WiFi", "Entertainment", "Meal"],
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = flightSearchSchema.parse({
      ...body,
      passengers: parseInt(body.passengers) || 1,
    });
    
    // Check if from and to are the same
    if (validatedData.from === validatedData.to) {
      return NextResponse.json({
        success: false,
        message: "Origin and destination cannot be the same",
      }, { status: 400 });
    }
    
    // Generate mock flights
    const flights = generateFlights(
      validatedData.from,
      validatedData.to,
      validatedData.departureDate,
      validatedData.flightType
    );
    
    return NextResponse.json({
      success: true,
      data: {
        flights,
        searchCriteria: {
          from: validatedData.from,
          to: validatedData.to,
          departureDate: validatedData.departureDate,
          passengers: validatedData.passengers,
          tripType: validatedData.tripType,
        },
        totalResults: flights.length,
        timestamp: new Date().toISOString(),
      },
    });
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
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  
  // Get popular routes
  const popularRoutes = [
    { from: "LUN", fromCity: "Lusaka", to: "LVI", toCity: "Livingstone", price: 185, duration: "2h 30m", stops: 0 },
    { from: "LUN", fromCity: "Lusaka", to: "JNB", toCity: "Johannesburg", price: 320, duration: "2h 45m", stops: 0 },
    { from: "LUN", fromCity: "Lusaka", to: "NBO", toCity: "Nairobi", price: 285, duration: "2h 15m", stops: 0 },
    { from: "LUN", fromCity: "Lusaka", to: "DXB", toCity: "Dubai", price: 650, duration: "8h 30m", stops: 1 },
  ];
  
  // Get available airports
  const localAirports = [
    { code: "LUN", city: "Lusaka", country: "Zambia" },
    { code: "LVI", city: "Livingstone", country: "Zambia" },
    { code: "NDLI", city: "Ndola", country: "Zambia" },
    { code: "KIW", city: "Kitwe", country: "Zambia" },
    { code: "MNS", city: "Mansa", country: "Zambia" },
    { code: "SLI", city: "Solwezi", country: "Zambia" },
  ];
  
  const internationalAirports = [
    { code: "JNB", city: "Johannesburg", country: "South Africa" },
    { code: "NBO", city: "Nairobi", country: "Kenya" },
    { code: "DXB", city: "Dubai", country: "UAE" },
    { code: "LHR", city: "London", country: "UK" },
    { code: "DOH", city: "Doha", country: "Qatar" },
  ];
  
  return NextResponse.json({
    success: true,
    data: {
      popularRoutes,
      airports: {
        local: localAirports,
        international: internationalAirports,
      },
    },
  });
}
