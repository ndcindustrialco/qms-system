import { requireAuth } from "@/lib/auth";
import { DarService } from "@/services/darService";
import { UserRepository } from "@/repositories/userRepository";
import { SystemConfigRepository } from "@/repositories/systemConfigRepository";
import { sendMrApprovalRequestEmail } from "@/services/email";
import { OBJECTIVE_LABELS, DOC_TYPE_LABELS } from "@/types/dar";
import { sendSuccess } from "@/lib/apiResponse";
import { handleApiError } from "@/lib/apiErrorHandler";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";

const darService = new DarService();
const userRepo = new UserRepository();
const configRepo = new SystemConfigRepository();

const schema = z.object({
  signatureDataUrl: z.string()
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, "Invalid signature format")
    .max(524288, "Signature image too large"),
  signatureType: z.enum(["DRAW", "TYPE", "IMAGE"]),
  saveSignature: z.boolean().default(false),
  comment: z.string().max(1000).optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const body = await req.json();
    const parsed = schema.parse(body);

    const dar = await darService.approveDar(id, session.user.id, {
      signatureDataUrl: parsed.signatureDataUrl,
      signatureType: parsed.signatureType,
      saveSignature: parsed.saveSignature,
      comment: parsed.comment ?? null,
    });

    revalidateTag(`dar-${id}`);
    revalidateTag("dar-list");

    // When the reviewer approves, notify MR — sender is the requester
    const reviewerApprovedThisStep = dar.approvals.some(
      (a) => a.stepRole === "REVIEWER" && a.assignedUser.id === session.user.id && a.action === "APPROVED"
    );
    const hasPendingMrStep = dar.approvals.some(
      (a) => a.stepRole === "APPROVER_MR" && a.action === "PENDING"
    );

    if (reviewerApprovedThisStep && hasPendingMrStep && dar.darNo) {
      const [mrConfigValue, requesterUser] = await Promise.all([
        configRepo.findValueByKey("CURRENT_MR_USER_ID"),
        userRepo.findById(dar.requester.id),
      ]);

      if (mrConfigValue) {
        const mrUser = await userRepo.findById(mrConfigValue);

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

    return sendSuccess(dar, "DAR approved successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
