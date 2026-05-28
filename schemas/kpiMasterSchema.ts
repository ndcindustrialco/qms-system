import { z } from 'zod';


export const createKpiMasterSchema = z.object({
  year: z.number().int().positive('Year must be a valid positive integer'),
  periodType: z.enum(['YEARLY', 'QUARTERLY']).optional(),
  objectiveDetails: z.string().min(1, 'Objective details are required'),
  measurementFrequency: z.string().optional(),
  calculationFormula: z.string().optional(),
  guidelines: z.string().optional(),
  trackingRecords: z.string().optional(),
  targetValue: z.number(),
  departmentId: z.string().uuid('Invalid department ID format'),
  createdById: z.string().uuid().optional(),
});

export const updateKpiMasterSchema = createKpiMasterSchema.partial();

export const kpiMasterQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().positive().optional(),
  departmentId: z.string().uuid().optional(),
  search: z.string().optional(),
});
