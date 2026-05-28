import { NextRequest } from 'next/server';
import { z } from 'zod';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { updateKpiObjectiveSchema } from '@/schemas/kpiWorkflowSchema';
import { KpiObjectiveService } from '@/services/kpiObjectiveService';

const service = new KpiObjectiveService();
const idSchema = z.string().uuid();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth();
    const { id: rawId } = await params;
    const id = idSchema.parse(rawId);
    const objective = await service.getById(id);
    return sendSuccess(objective, 'KPI objective retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: rawId } = await params;
    const id = idSchema.parse(rawId);
    const body = updateKpiObjectiveSchema.parse(await request.json());
    const updated = await service.updateDraft(id, body, {
      userId: session.user.id,
      role: session.user.role,
      departmentId: session.user.departmentId,
    });

    return sendSuccess(updated, 'KPI objective updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
