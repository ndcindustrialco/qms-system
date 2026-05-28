import { NextRequest } from 'next/server';
import { z } from 'zod';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { KpiAuditService } from '@/services/kpiAuditService';

const service = new KpiAuditService();
const idSchema = z.string().uuid();

interface RouteParams { params: Promise<{ id: string }>; }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: rawId } = await params;
    const logs = await service.listByRecordId(idSchema.parse(rawId), {
      userId: session.user.id,
      role: session.user.role,
      departmentId: session.user.departmentId,
    });

    return sendSuccess(logs, 'KPI audit logs retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
