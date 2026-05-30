import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { submitKpiObjectivesSchema } from '@/schemas/kpiSchema';
import { KpiService } from '@/services/kpiService';
import { UserRepository } from '@/repositories/userRepository';
import { sendKpiObjectiveReviewerAssignedEmail } from '@/services/email';

const service = new KpiService();
const userRepo = new UserRepository();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = submitKpiObjectivesSchema.parse(await request.json());
    const updated = await service.submitObjectives(id, body, session.user.id);

    const [reviewer, requester] = await Promise.all([
      userRepo.findById(body.reviewerUserId),
      userRepo.findById(session.user.id),
    ]);
    if (reviewer?.email) {
      sendKpiObjectiveReviewerAssignedEmail({
        reviewer: { name: reviewer.name ?? '', email: reviewer.email },
        requesterName: requester?.name ?? session.user.name ?? '',
        departmentName: updated.department,
        objectiveId: updated.id,
        objective: updated.objectives.map((o) => o.objective).join(', '),
        year: updated.yearly,
      }).catch((e) => console.error('[email] Failed to send KPI reviewer request email:', e));
    }

    return sendSuccess(updated, 'KPI objectives submitted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
