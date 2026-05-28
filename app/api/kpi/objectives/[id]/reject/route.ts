import { NextRequest } from 'next/server';
import { z } from 'zod';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { rejectKpiObjectiveSchema } from '@/schemas/kpiWorkflowSchema';
import { KpiObjectiveService } from '@/services/kpiObjectiveService';

const service = new KpiObjectiveService();
const idSchema = z.string().uuid();

interface RouteParams { params: Promise<{ id: string }>; }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: rawId } = await params;
    rejectKpiObjectiveSchema.parse(await request.json());
    const updated = await service.reject(idSchema.parse(rawId), {
      userId: session.user.id,
      role: session.user.role,
      departmentId: session.user.departmentId,
    });

    return sendSuccess(updated, 'KPI objective rejected successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
