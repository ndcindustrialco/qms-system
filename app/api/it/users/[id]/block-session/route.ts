
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { db } from "@/lib/db";
import { blockJwt } from "@/lib/jwt-blocklist";
import type { ApiResponse } from "@/types/api";

const bodySchema = z.object({
  /** The user's current JTI (from their session) to add to the blocklist */
  jti: z.string().min(1),
  /** Remaining token lifetime in seconds (used as Redis TTL) */
  ttlSec: z.number().int().positive().max(86400),
});

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/it/users/[id]/block-session
 *
 * Force-logout a specific user by adding their current JWT ID (jti)
 * to the Redis blocklist. The middleware will redirect them to login
 * on their next request.
 *
 * Requires IT role.
 *
 * Body: { jti: string, ttlSec: number }
 */
export async function POST(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<{ blocked: true }>>> {
  try {
    await requireRole("IT");
    const { id } = await params;

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues[0]?.message ?? "Invalid body" },
        { status: 400 }
      );
    }

    const { jti, ttlSec } = parsed.data;

    // Verify the target user exists
    const user = await db.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ data: null, error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    await blockJwt(jti, ttlSec);

    return NextResponse.json({ data: { blocked: true }, error: null });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ data: null, error: err.message }, { status: err.statusCode });
    }
    console.error("[POST /api/it/users/[id]/block-session]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
