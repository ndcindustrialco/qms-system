import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/apiErrorHandler";
import { ApprovalConfigService } from "@/services/approvalConfigService";

const bodySchema = z.object({
  role: z.enum(["USER", "MR", "QMS"]),
});

type Params = { params: Promise<{ id: string }> };

const service = new ApprovalConfigService();

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireRole("QMS", "IT", "MR");
    const { id } = await params;

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: "Invalid role value" }, { status: 400 });
    }

    const updated = await service.updateUserMrQmsRole(id, parsed.data.role);
    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    return handleApiError(err);
  }
}
