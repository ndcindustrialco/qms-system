import { KpiApprovalStatus, KpiMonthlyStatus, KpiObjectiveStatus, KpiWorkflowAction, KpiSignerRole } from '@/generated/prisma/client';

export interface ActorContext {
  userId: string;
  role: 'USER' | 'IT' | 'QMS' | 'MR';
  departmentId?: string | null;
}

export interface UpdateMonthlyDraftDTO {
  actualValue?: number;
  isNa?: boolean;
  status?: KpiMonthlyStatus;
}

export interface ListObjectiveQuery {
  page: number;
  limit: number;
  year?: number;
  departmentId?: string;
  search?: string;
}

export interface ListMonthlyQuery {
  page: number;
  limit: number;
  year?: number;
  month?: number;
  departmentId?: string;
  approvalStatus?: KpiApprovalStatus;
}

export interface AuditSnapshot {
  approvalStatus?: KpiApprovalStatus;
  status?: KpiMonthlyStatus;
  actualValue?: string | null;
  rejectionReason?: string | null;
}

export interface CreateSignatureLogDTO {
  kpiMonthlyResultId: string;
  signerId: string;
  signerRole: KpiSignerRole;
  contentHash: string;
  action: KpiWorkflowAction;
}

export interface ObjectiveWorkflowUpdateDTO {
  objectiveStatus: KpiObjectiveStatus;
  approvedById?: string | null;
  approvedAt?: Date | null;
}
