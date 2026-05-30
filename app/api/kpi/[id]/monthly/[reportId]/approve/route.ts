import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { KpiMonthlyService } from '@/services/kpiMonthlyService';
import { UserRepository } from '@/repositories/userRepository';
import { sendKpiMonthlyResultEmail } from '@/services/email';

const service = new KpiMonthlyService();
const userRepo = new UserRepository();

export async function POST(_req: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const session = await requireAuth();
    const { reportId } = await params;
    const body = await _req.json().catch(() => ({}));
    const updated = await service.approveReport(reportId, { userId: session.user.id, role: session.user.role, departmentId: session.user.departmentId }, body);

    const detail = await service.getReportById(reportId);
    if (detail.prepareBy) {
      const preparer = await userRepo.findById(detail.prepareBy);
      if (preparer?.email) {
        sendKpiMonthlyResultEmail({
          to: { name: preparer.name ?? '', email: preparer.email },
          departmentName: detail.kpi.department,
          month: detail.month,
          year: detail.year,
          status: 'APPROVED',
          actorName: session.user.name ?? '',
        }).catch((e) => console.error('[email] Failed to send monthly approved email:', e));
      }
    }

    return sendSuccess(updated, 'Monthly report approved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
