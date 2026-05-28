import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { createKpiObjectiveSchema, kpiObjectiveQuerySchema } from '@/schemas/kpiWorkflowSchema';
import { KpiObjectiveService } from '@/services/kpiObjectiveService';

const service = new KpiObjectiveService();

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const query = kpiObjectiveQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await service.list({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      year: query.year,
      departmentId: query.departmentId,
      search: query.search,
    });

    return sendSuccess(result.data, 'KPI objectives retrieved successfully', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = createKpiObjectiveSchema.parse(await request.json());

    const created = await service.createDraft(body, {
      userId: session.user.id,
      role: session.user.role,
      departmentId: session.user.departmentId,
    });

    return sendSuccess(created, 'KPI objective created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
