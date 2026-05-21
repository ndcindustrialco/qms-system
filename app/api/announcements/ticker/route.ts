export const runtime = 'edge';

import { db } from "@/lib/db";
import { announcements } from "@/db/schema";
import { eq, and, or, isNull, lte, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import type { ApiResponse } from "@/types/api";

type TickerItem = { id: string; title: string; sourceSystem: string };

export async function GET(): Promise<NextResponse<ApiResponse<TickerItem[]>>> {
  try {
    await requireAuth();

    const now = new Date();

    const rows = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        sourceSystem: announcements.sourceSystem,
      })
      .from(announcements)
      .where(
        and(
          eq(announcements.displayType, "SCROLLING"),
          or(isNull(announcements.startDate), lte(announcements.startDate, now)),
          or(isNull(announcements.expiryDate), gte(announcements.expiryDate, now)),
        )
      )
      .limit(20);

    return NextResponse.json({ data: rows, error: null });
  } catch {
    // ticker is non-critical — silently return empty
    return NextResponse.json({ data: [], error: null });
  }
}
