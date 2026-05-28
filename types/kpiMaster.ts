import { KpiPeriodType } from '@/generated/prisma/client';

export interface CreateKpiMasterDTO {
  year: number;
  periodType?: KpiPeriodType;
  objectiveDetails: string;
  measurementFrequency?: string;
  calculationFormula?: string;
  guidelines?: string;
  trackingRecords?: string;
  targetValue: number;
  departmentId: string;
  createdById?: string;
}

export interface UpdateKpiMasterDTO {
  year?: number;
  periodType?: KpiPeriodType;
  objectiveDetails?: string;
  measurementFrequency?: string;
  calculationFormula?: string;
  guidelines?: string;
  trackingRecords?: string;
  targetValue?: number;
  departmentId?: string;
}

export interface KpiMasterQueryDTO {
  page?: number;
  limit?: number;
  year?: number;
  departmentId?: string;
  search?: string;
}
