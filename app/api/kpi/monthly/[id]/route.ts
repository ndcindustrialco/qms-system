import { NextRequest } from 'next/server';
import { z } from 'zod';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { updateMonthlyDraftSchema } from '@/schemas/kpiWorkflowSchema';
import { KpiMonthlyService } from '@/services/kpiMonthlyService';

const service = new KpiMonthlyService();
const idSchema = z.string().uuid();

interface RouteParams { params: Promise<{ id: string }>; }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth();
    const { id: rawId } = await params;
    const row = await service.getById(idSchema.parse(rawId));
    return sendSuccess(row, 'KPI monthly record retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: rawId } = await params;
    const payload = updateMonthlyDraftSchema.parse(await request.json());
    const updated = await service.updateDraft(idSchema.parse(rawId), payload, {
      userId: session.user.id,
      role: session.user.role,
      departmentId: session.user.departmentId,
    });

    return sendSuccess(updated, 'KPI monthly record updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
