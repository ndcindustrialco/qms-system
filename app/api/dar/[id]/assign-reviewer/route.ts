import { requireAuth } from "@/lib/auth";
import { DarService } from "@/services/darService";
import { UserRepository } from "@/repositories/userRepository";
import { sendReviewerAssignedEmail } from "@/services/email";
import { OBJECTIVE_LABELS, DOC_TYPE_LABELS } from "@/types/dar";
import { sendSuccess } from "@/lib/apiResponse";
import { handleApiError } from "@/lib/apiErrorHandler";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";

const darService = new DarService();
const userRepo = new UserRepository();

const schema = z.object({
  reviewerUserId: z.string().uuid(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const body = await req.json();
    const parsed = schema.parse(body);

    const dar = await darService.assignReviewer(id, session.user.id, parsed.reviewerUserId);

    revalidateTag(`dar-${id}`);
    revalidateTag("dar-list");

    // Send email notification to reviewer (fire-and-forget — don't fail the request)
    const reviewerUser = await userRepo.findById(parsed.reviewerUserId);

    if (reviewerUser?.email && dar.darNo) {
      sendReviewerAssignedEmail({
        reviewer: { name: reviewerUser.name ?? "", email: reviewerUser.email },
        requesterName: dar.requester.name ?? session.user.name ?? "",
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
        attachments: dar.attachments.map((a) => ({
          fileName: a.fileName,
          spWebUrl: a.spWebUrl,
        })),
        senderEmail: session.user.email ?? undefined,
      }).catch((e) => console.error("[email] Failed to send reviewer notification:", e));
    }

    return sendSuccess(dar, "Reviewer assigned successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
