import { ForbiddenError, NotFoundError } from '@/errors/customErrors';
import { KpiAuditLogRepository } from '@/repositories/kpiAuditLogRepository';
import { KpiMonthlyRepository } from '@/repositories/kpiMonthlyRepository';
import { ActorContext } from '@/types/kpiWorkflow';

export class KpiAuditService {
  private auditRepo = new KpiAuditLogRepository();
  private monthlyRepo = new KpiMonthlyRepository();

  async listByRecordId(recordId: string, actor: ActorContext) {
    const record = await this.monthlyRepo.findByIdWithRelations(recordId);
    if (!record) throw new NotFoundError(`KPI monthly record ${recordId} not found`);

    const isPrivileged = actor.role === 'QMS' || actor.role === 'MR' || actor.role === 'IT';
    if (!isPrivileged && actor.departmentId !== record.kpiMaster.departmentId) {
      throw new ForbiddenError('Cannot access another department audit logs');
    }

    return this.auditRepo.listByRecordId(recordId);
  }
}
