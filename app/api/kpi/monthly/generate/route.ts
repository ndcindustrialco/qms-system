import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireRole } from '@/lib/auth';
import { generateMonthlySchema } from '@/schemas/kpiWorkflowSchema';
import { KpiMonthlyService } from '@/services/kpiMonthlyService';

const service = new KpiMonthlyService();

export async function POST(request: NextRequest) {
  try {
    await requireRole('QMS', 'MR', 'IT');
    const body = generateMonthlySchema.parse(await request.json());
    const result = await service.generateMonthlyRecords(body.year, body.month, body.departmentId);
    return sendSuccess(result, 'KPI monthly records generated successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
