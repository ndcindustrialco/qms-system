import { NextRequest } from 'next/server';
import { z } from 'zod';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { KpiAttachmentService } from '@/services/kpiAttachmentService';

const service = new KpiAttachmentService();
const idSchema = z.string().uuid();

interface RouteParams { params: Promise<{ id: string; attachmentId: string }>; }

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: rawId, attachmentId: rawAttachmentId } = await params;
    const id = idSchema.parse(rawId);
    const attachmentId = idSchema.parse(rawAttachmentId);

    await service.remove(id, attachmentId, {
      userId: session.user.id,
      role: session.user.role,
      departmentId: session.user.departmentId,
    });

    return sendSuccess(null, 'KPI attachment deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
