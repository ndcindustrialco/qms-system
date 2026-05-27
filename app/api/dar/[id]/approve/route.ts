
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { approveDar } from "@/services/dar";
import { sendMrApprovalRequestEmail } from "@/services/email";
import { OBJECTIVE_LABELS, DOC_TYPE_LABELS } from "@/types/dar";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types/api";
import type { DarDetail } from "@/types/dar";

const schema = z.object({
  signatureDataUrl: z.string()
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, "Invalid signature format")
    .max(524288, "Signature image too large"),
  signatureType: z.enum(["DRAW", "TYPE", "IMAGE"]),
  saveSignature: z.boolean().default(false),
  comment: z.string().max(1000).optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse<ApiResponse<DarDetail>>> {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message ?? "Invalid request body";
      return NextResponse.json({ data: null, error }, { status: 400 });
    }

    const dar = await approveDar(id, session.user.id, {
      signatureDataUrl: parsed.data.signatureDataUrl,
      signatureType: parsed.data.signatureType,
      saveSignature: parsed.data.saveSignature,
      comment: parsed.data.comment ?? null,
    });

    revalidateTag(`dar-${id}`);
    revalidateTag("dar-list");

    // When the reviewer approves, notify MR — sender is the requester
    const reviewerApprovedThisStep = dar.approvals.some(
      (a) => a.stepRole === "REVIEWER" && a.assignedUser.id === session.user.id && a.action === "APPROVED",
    );
    const hasPendingMrStep = dar.approvals.some(
      (a) => a.stepRole === "APPROVER_MR" && a.action === "PENDING",
    );

    if (reviewerApprovedThisStep && hasPendingMrStep && dar.darNo) {
      const [mrConfig, requesterUser] = await Promise.all([
        db.systemConfig.findUnique({ where: { configKey: "CURRENT_MR_USER_ID" }, select: { configValue: true } }),
        db.user.findUnique({ where: { id: dar.requester.id }, select: { name: true, email: true } }),
      ]);

      if (mrConfig?.configValue) {
        const mrUser = await db.user.findUnique({
          where: { id: mrConfig.configValue },
          select: { name: true, email: true },
        });

        if (mrUser?.email) {
          sendMrApprovalRequestEmail({
            mr: { name: mrUser.name ?? "", email: mrUser.email },
            reviewerName: session.user.name ?? "",
            requesterName: dar.requester.name ?? "",
            requesterDepartment: dar.requester.department?.name ?? null,
            darNo: dar.darNo,
            darId: dar.id,
            requestDate: dar.requestDate,
            objective: OBJECTIVE_LABELS[dar.objective],
            docType: dar.docTypeOther
              ? `${DOC_TYPE_LABELS[dar.docType]} — ${dar.docTypeOther}`
              : DOC_TYPE_LABELS[dar.docType],
            reason: dar.reason,
            items: dar.items,
            attachments: dar.attachments.map((a) => ({ fileName: a.fileName, spWebUrl: a.spWebUrl })),
            senderEmail: requesterUser?.email ?? undefined,
          }).catch((e) => console.error("[email] Failed to send MR approval request email:", e));
        }
      }
    }

    return NextResponse.json({ data: dar, error: null });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ data: null, error: err.message }, { status: err.statusCode });
    }
    console.error("[POST /api/dar/[id]/approve]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
