import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { kpiMonthlyQuerySchema } from '@/schemas/kpiWorkflowSchema';
import { KpiMonthlyService } from '@/services/kpiMonthlyService';

const service = new KpiMonthlyService();

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const query = kpiMonthlyQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await service.listMonthly({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      year: query.year,
      month: query.month,
      departmentId: query.departmentId,
      approvalStatus: query.approvalStatus,
    });

    return sendSuccess(result.data, 'KPI monthly records retrieved successfully', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
