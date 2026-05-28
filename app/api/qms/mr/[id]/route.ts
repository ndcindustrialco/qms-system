
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types/api";

const bodySchema = z.object({
  role: z.enum(["USER", "MR"]),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse<ApiResponse<{ id: string; role: string }>>> {
  try {
    await requireRole("QMS", "IT", "MR");
    const { id } = await params;

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: "Invalid role value" }, { status: 400 });
    }

    const { role } = parsed.data;
    const existing = await db.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!existing) {
      return NextResponse.json({ data: null, error: "User not found" }, { status: 404 });
    }

    if (!["USER", "MR"].includes(existing.role)) {
      return NextResponse.json(
        { data: null, error: "Cannot change role for QMS or IT users via this endpoint" },
        { status: 403 }
      );
    }

    const updated = await db.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { role },
        select: { id: true, role: true },
      });

      if (role === "MR") {
        await tx.systemConfig.upsert({
          where: { configKey: "CURRENT_MR_USER_ID" },
          update: { configValue: id },
          create: { configKey: "CURRENT_MR_USER_ID", configValue: id, description: "Designated MR user for DAR approvals" },
        });
      } else {
        // Remove the config key only if it currently points to this user
        await tx.systemConfig.deleteMany({
          where: { configKey: "CURRENT_MR_USER_ID", configValue: id },
        });
      }

      return user;
    });

    return NextResponse.json({ data: { id: updated.id, role: updated.role }, error: null });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ data: null, error: err.message }, { status: err.statusCode });
    }
    console.error("[PATCH /api/qms/mr/[id]]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
