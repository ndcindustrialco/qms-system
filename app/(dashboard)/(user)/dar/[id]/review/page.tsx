import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getDarById, getSavedSignature } from "@/services/dar";
import DarReviewLayout from "@/components/dar/DarReviewLayout";

type Props = { params: Promise<{ id: string }> };

export default async function DarReviewPage({ params }: Props) {
  const [session, { id }] = await Promise.all([requireAuth(), params]);
  try {
    const [dar, savedSig] = await Promise.all([
      getDarById(id, session.user.id),
      getSavedSignature(session.user.id),
    ]);

    const isAssignedReviewer = dar.approvals.some(
      (a) =>
        a.stepRole === "REVIEWER" &&
        a.assignedUser.id === session.user.id &&
        a.action === "PENDING",
    );

    if (!isAssignedReviewer) {
      redirect(`/dar/${id}`);
    }

    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <DarReviewLayout
          dar={dar}
          darId={id}
          darNo={dar.darNo}
          currentUserId={session.user.id}
          savedSignatureUrl={savedSig?.url ?? null}
          savedSignatureType={savedSig?.type ?? null}
          isAssignedReviewer={isAssignedReviewer}
        />
      </div>
    );
  } catch {
    notFound();
  }
}
