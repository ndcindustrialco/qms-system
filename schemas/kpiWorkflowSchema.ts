import { z } from 'zod';

export const kpiObjectiveQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().positive().optional(),
  departmentId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const createKpiObjectiveSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  objectiveDetails: z.string().min(1),
  measurementFrequency: z.string().optional(),
  calculationFormula: z.string().optional(),
  guidelines: z.string().optional(),
  trackingRecords: z.string().optional(),
  targetValue: z.number().nonnegative(),
  departmentId: z.string().uuid(),
});

export const updateKpiObjectiveSchema = createKpiObjectiveSchema.partial();

export const kpiIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const rejectKpiObjectiveSchema = z.object({
  reason: z.string().min(1),
});

export const generateMonthlySchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  departmentId: z.string().uuid().optional(),
});

export const kpiMonthlyQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().positive().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  departmentId: z.string().uuid().optional(),
  approvalStatus: z.enum(['DRAFT', 'SUBMITTED', 'REVIEWED', 'VERIFIED', 'REJECTED']).optional(),
});

export const updateMonthlyDraftSchema = z.object({
  actualValue: z.number().nonnegative().optional(),
  isNa: z.boolean().optional(),
  status: z.enum(['OK', 'NG', 'PENDING']).optional(),
});

export const rejectMonthlySchema = z.object({
  reason: z.string().min(1),
});
