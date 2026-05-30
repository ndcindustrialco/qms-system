import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { KpiMonthlyService } from '@/services/kpiMonthlyService';
import { UserRepository } from '@/repositories/userRepository';
import { sendKpiMonthlyApprovalRequestEmail } from '@/services/email';

const service = new KpiMonthlyService();
const userRepo = new UserRepository();

export async function POST(_req: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const session = await requireAuth();
    const { reportId } = await params;
    const updated = await service.submitReport(reportId, { userId: session.user.id, role: session.user.role, departmentId: session.user.departmentId });

    const detail = await service.getReportById(reportId);
    if (detail.kpi.approverUserId) {
      const [approver, preparer] = await Promise.all([
        userRepo.findById(detail.kpi.approverUserId),
        userRepo.findById(session.user.id),
      ]);
      if (approver?.email) {
        sendKpiMonthlyApprovalRequestEmail({
          approver: { name: approver.name ?? '', email: approver.email },
          departmentName: detail.kpi.department,
          month: detail.month,
          year: detail.year,
          preparerName: preparer?.name ?? session.user.name ?? '',
        }).catch((e) => console.error('[email] Failed to send monthly approver request email:', e));
      }
    }

    return sendSuccess(updated, 'Monthly report submitted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
