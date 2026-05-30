import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { KpiService } from '@/services/kpiService';
import { UserRepository } from '@/repositories/userRepository';
import { sendKpiResultEmail } from '@/services/email';

const service = new KpiService();
const userRepo = new UserRepository();

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const updated = await service.rejectObjectives(id, {
      userId: session.user.id,
      role: session.user.role,
      departmentId: session.user.departmentId,
    });

    const recipients = [updated.reviewerUserId, updated.approverUserId].filter(Boolean) as string[];
    if (recipients.length > 0) {
      const users = await Promise.all(recipients.map((userId) => userRepo.findById(userId)));
      users
        .filter((u): u is NonNullable<typeof u> => Boolean(u?.email))
        .forEach((u) => {
          sendKpiResultEmail({
            to: { name: u.name ?? '', email: u.email },
            departmentName: updated.department,
            year: updated.yearly,
            status: 'REJECTED',
            actorName: session.user.name ?? '',
          }).catch((e) => console.error('[email] Failed to send KPI rejected email:', e));
        });
    }

    return sendSuccess(updated, 'KPI rejected successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
