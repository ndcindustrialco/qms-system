import { z } from 'zod';

export const uploadKpiAttachmentSchema = z.object({
  folderPath: z.string().min(1).default('KPI'),
});

export const attachmentIdParamSchema = z.object({
  id: z.string().uuid(),
  attachmentId: z.string().uuid(),
});
