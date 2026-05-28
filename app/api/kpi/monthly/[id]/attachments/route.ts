import { NextRequest } from 'next/server';
import { z } from 'zod';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth } from '@/lib/auth';
import { uploadKpiAttachmentSchema } from '@/schemas/kpiAttachmentSchema';
import { KpiAttachmentService } from '@/services/kpiAttachmentService';
import { ValidationError } from '@/errors/customErrors';

const service = new KpiAttachmentService();
const idSchema = z.string().uuid();

interface RouteParams { params: Promise<{ id: string }>; }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: rawId } = await params;
    const id = idSchema.parse(rawId);

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      throw new ValidationError('file is required');
    }

    const parsed = uploadKpiAttachmentSchema.parse({
      folderPath: formData.get('folderPath')?.toString() ?? 'KPI',
    });

    const created = await service.upload(id, file, {
      userId: session.user.id,
      role: session.user.role,
      departmentId: session.user.departmentId,
    }, parsed.folderPath);

    return sendSuccess(created, 'KPI attachment uploaded successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
