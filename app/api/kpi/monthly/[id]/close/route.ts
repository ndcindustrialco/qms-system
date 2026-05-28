import { NextRequest } from 'next/server';
import { z } from 'zod';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { KpiMonthlyService } from '@/services/kpiMonthlyService';

const service = new KpiMonthlyService();
const idSchema = z.string().uuid();

interface RouteParams { params: Promise<{ id: string }>; }

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: rawId } = await params;
    const updated = await service.close(idSchema.parse(rawId), {
      userId: session.user.id,
      role: session.user.role,
      departmentId: session.user.departmentId,
    });
    return sendSuccess(updated, 'KPI monthly record closed successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
