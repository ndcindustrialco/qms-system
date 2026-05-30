import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/apiErrorHandler";
import { UserService } from "@/services/userService";
import { ValidationError } from "@/lib/errors";

const bodySchema = z.object({
  role: z.enum(["USER", "IT", "QMS", "MR"]).optional(),
  departmentId: z.string().nullable().optional(),
  employeeId: z.string().max(16).nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

const userService = new UserService();

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireRole("IT");
    const { id } = await params;

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
    }

    const { role, departmentId, employeeId } = parsed.data;
    if (role === undefined && departmentId === undefined && employeeId === undefined) {
      throw new ValidationError("Nothing to update");
    }

    const updated = await userService.updateUserAttributes(id, {
      ...(role !== undefined ? { role } : {}),
      ...(departmentId !== undefined ? { departmentId } : {}),
      ...(employeeId !== undefined ? { employeeId: employeeId || null } : {}),
    });

    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    return handleApiError(err);
  }
}
