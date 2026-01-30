import { getMisriDate } from "@/lib/calendar";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  // 1. Extract searchParams from the request URL
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  // 2. Handle logic
  if (!date) {
    const today = new Date();
    const hijriDate = getMisriDate(today);
    return NextResponse.json(hijriDate);
  }

  const hijriDate = getMisriDate(new Date(date));
  return NextResponse.json(hijriDate);
};
