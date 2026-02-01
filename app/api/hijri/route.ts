import { getMisriDate } from "@/lib/calendar";
import { NextResponse } from "next/server";

// Enable edge runtime for global low-latency access
export const runtime = "edge";

// Ensure dynamic rendering (fresh data on every request)
export const dynamic = "force-dynamic";

// Handle OPTIONS preflight requests for CORS
export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 204,
  });
};

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  try {
    // Use provided date or default to current UTC date
    const targetDate = date ?? new Date().toISOString().slice(0, 10);

    // Validate date format before processing
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD" },
        { status: 400 },
      );
    }

    const result = getMisriDate(targetDate);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Invalid date. Expected YYYY-MM-DD";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
};
