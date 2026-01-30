import { getMisriDate } from "@/lib/calendar";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  try {
    const targetDate = date ?? new Date().toISOString().slice(0, 10);
    return NextResponse.json(getMisriDate(targetDate));
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid date. Expected YYYY-MM-DD" },
      { status: 400 },
    );
  }
};
