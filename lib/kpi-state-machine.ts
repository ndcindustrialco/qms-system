import { KpiApprovalStatus } from '@/generated/prisma/client';
import { ConflictError } from '@/errors/customErrors';

const ALLOWED_TRANSITIONS: Record<KpiApprovalStatus, KpiApprovalStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['REVIEWED', 'REJECTED'],
  REVIEWED: ['VERIFIED', 'REJECTED'],
  VERIFIED: [],
  REJECTED: ['DRAFT'],
};

export function ensureKpiApprovalTransition(from: KpiApprovalStatus, to: KpiApprovalStatus): void {
  if (from === to) return;
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new ConflictError(`Invalid KPI approval transition: ${from} -> ${to}`);
  }
}
