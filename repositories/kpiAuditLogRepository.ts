import { KpiAuditLog, KpiWorkflowAction, Prisma } from '@/generated/prisma/client';
import { BaseRepository } from '@/repositories/baseRepository';

export class KpiAuditLogRepository extends BaseRepository<KpiAuditLog, Prisma.KpiAuditLogCreateInput, Prisma.KpiAuditLogUpdateInput> {
  constructor() {
    super('kpiAuditLog');
  }

  async logEvent(payload: {
    kpiMonthlyResultId: string;
    actorUserId: string;
    action: KpiWorkflowAction;
    beforeJson?: Prisma.JsonValue;
    afterJson?: Prisma.JsonValue;
  }, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).create({
      data: {
        kpiMonthlyResult: { connect: { id: payload.kpiMonthlyResultId } },
        actorUser: { connect: { id: payload.actorUserId } },
        action: payload.action,
        beforeJson: payload.beforeJson,
        afterJson: payload.afterJson,
      },
    });
  }

  async listByRecordId(recordId: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findMany({
      where: { kpiMonthlyResultId: recordId },
      include: { actorUser: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
