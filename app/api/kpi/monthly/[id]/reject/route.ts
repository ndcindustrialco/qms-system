import { NextRequest } from 'next/server';
import { z } from 'zod';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { rejectMonthlySchema } from '@/schemas/kpiWorkflowSchema';
import { KpiMonthlyService } from '@/services/kpiMonthlyService';

const service = new KpiMonthlyService();
const idSchema = z.string().uuid();

interface RouteParams { params: Promise<{ id: string }>; }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: rawId } = await params;
    const body = rejectMonthlySchema.parse(await request.json());
    const updated = await service.reject(idSchema.parse(rawId), body.reason, {
      userId: session.user.id,
      role: session.user.role,
      departmentId: session.user.departmentId,
    });
    return sendSuccess(updated, 'KPI monthly record rejected successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
