import { ConflictError, ForbiddenError, NotFoundError } from '@/errors/customErrors';
import { db } from '@/lib/db';
import { ensureKpiApprovalTransition } from '@/lib/kpi-state-machine';
import { createContentHash } from '@/lib/signature-hash';
import { KpiApprovalStatus, KpiMonthlyStatus, KpiWorkflowAction } from '@/generated/prisma/client';
import { KpiAuditLogRepository } from '@/repositories/kpiAuditLogRepository';
import { KpiMonthlyRepository } from '@/repositories/kpiMonthlyRepository';
import { KpiObjectiveRepository } from '@/repositories/kpiObjectiveRepository';
import { KpiSignatureRepository } from '@/repositories/kpiSignatureRepository';
import { ActorContext, ListMonthlyQuery, UpdateMonthlyDraftDTO } from '@/types/kpiWorkflow';

export class KpiMonthlyService {
  private monthlyRepo = new KpiMonthlyRepository();
  private objectiveRepo = new KpiObjectiveRepository();
  private signatureRepo = new KpiSignatureRepository();
  private auditRepo = new KpiAuditLogRepository();

  async generateMonthlyRecords(year: number, month: number, departmentId?: string) {
    const objectives = await this.objectiveRepo.listApprovedForPeriod(year, departmentId);

    const created = await db.$transaction(async (tx) => {
      const rows = [];
      for (const objective of objectives) {
        const row = await this.monthlyRepo.createIfNotExists({
          kpiMasterId: objective.id,
          periodYear: year,
          month,
        }, tx);
        rows.push(row);
      }
      return rows;
    });

    return { generated: created.length, rows: created };
  }

  async listMonthly(query: ListMonthlyQuery) {
    return this.monthlyRepo.paginateMonthly(query);
  }

  async getById(id: string) {
    const row = await this.monthlyRepo.findByIdWithRelations(id);
    if (!row) throw new NotFoundError(`KPI monthly record ${id} not found`);
    return row;
  }

  async updateDraft(id: string, payload: UpdateMonthlyDraftDTO, actor: ActorContext) {
    const row = await this.getById(id);
    if (row.approvalStatus !== KpiApprovalStatus.DRAFT && row.approvalStatus !== KpiApprovalStatus.REJECTED) {
      throw new ConflictError('Only draft/rejected monthly record can be edited');
    }

    if (actor.role === 'USER' && row.kpiMaster.departmentId !== actor.departmentId) {
      throw new ForbiddenError('Cannot edit another department KPI record');
    }

    return this.monthlyRepo.updateDraft(id, payload);
  }

  async submit(id: string, actor: ActorContext) {
    const row = await this.getById(id);
    if (actor.role === 'USER' && row.kpiMaster.departmentId !== actor.departmentId) {
      throw new ForbiddenError('Cannot submit another department KPI record');
    }

    ensureKpiApprovalTransition(row.approvalStatus, KpiApprovalStatus.SUBMITTED);

    return db.$transaction(async (tx) => {
      const before = {
        approvalStatus: row.approvalStatus,
        status: row.status,
        actualValue: row.actualValue?.toString() ?? null,
      };

      const updated = await this.monthlyRepo.update(id, {
        approvalStatus: KpiApprovalStatus.SUBMITTED,
        submittedBy: { connect: { id: actor.userId } },
        submittedAt: new Date(),
      }, tx);

      const signaturePayload = {
        recordId: row.id,
        approvalStatus: KpiApprovalStatus.SUBMITTED,
        status: row.status,
        actualValue: row.actualValue?.toString() ?? null,
        submittedById: actor.userId,
      };

      await this.signatureRepo.addSignature({
        kpiMonthlyResultId: row.id,
        signerId: actor.userId,
        signerRole: 'SUBMITTER',
        contentHash: createContentHash(signaturePayload),
        action: KpiWorkflowAction.SUBMIT,
      }, tx);

      await this.auditRepo.logEvent({
        kpiMonthlyResultId: row.id,
        actorUserId: actor.userId,
        action: KpiWorkflowAction.SUBMIT,
        beforeJson: before,
        afterJson: {
          ...before,
          approvalStatus: KpiApprovalStatus.SUBMITTED,
        },
      }, tx);

      return updated;
    });
  }

  async approve(id: string, actor: ActorContext) {
    const row = await this.getById(id);
    if (!['QMS', 'MR', 'IT'].includes(actor.role)) {
      throw new ForbiddenError('Only approver roles can approve monthly KPI');
    }

    ensureKpiApprovalTransition(row.approvalStatus, KpiApprovalStatus.REVIEWED);

    return db.$transaction(async (tx) => {
      const before = {
        approvalStatus: row.approvalStatus,
        status: row.status,
        actualValue: row.actualValue?.toString() ?? null,
      };

      const updated = await this.monthlyRepo.update(id, {
        approvalStatus: KpiApprovalStatus.REVIEWED,
        approvedBy: { connect: { id: actor.userId } },
        approvedAt: new Date(),
      }, tx);

      const signaturePayload = {
        recordId: row.id,
        approvalStatus: KpiApprovalStatus.REVIEWED,
        status: row.status,
        actualValue: row.actualValue?.toString() ?? null,
        approvedById: actor.userId,
      };

      await this.signatureRepo.addSignature({
        kpiMonthlyResultId: row.id,
        signerId: actor.userId,
        signerRole: 'APPROVER',
        contentHash: createContentHash(signaturePayload),
        action: KpiWorkflowAction.APPROVE,
      }, tx);

      await this.auditRepo.logEvent({
        kpiMonthlyResultId: row.id,
        actorUserId: actor.userId,
        action: KpiWorkflowAction.APPROVE,
        beforeJson: before,
        afterJson: {
          ...before,
          approvalStatus: KpiApprovalStatus.REVIEWED,
        },
      }, tx);

      return updated;
    });
  }

  async reject(id: string, reason: string, actor: ActorContext) {
    const row = await this.getById(id);
    if (!['QMS', 'MR', 'IT'].includes(actor.role)) {
      throw new ForbiddenError('Only approver roles can reject monthly KPI');
    }

    if (row.approvalStatus !== KpiApprovalStatus.SUBMITTED && row.approvalStatus !== KpiApprovalStatus.REVIEWED) {
      throw new ConflictError('Only submitted/reviewed monthly record can be rejected');
    }

    return db.$transaction(async (tx) => {
      const updated = await this.monthlyRepo.update(id, {
        approvalStatus: KpiApprovalStatus.REJECTED,
        rejectionReason: reason,
      }, tx);

      await this.auditRepo.logEvent({
        kpiMonthlyResultId: row.id,
        actorUserId: actor.userId,
        action: KpiWorkflowAction.REJECT,
        beforeJson: {
          approvalStatus: row.approvalStatus,
          rejectionReason: row.rejectionReason,
        },
        afterJson: {
          approvalStatus: KpiApprovalStatus.REJECTED,
          rejectionReason: reason,
        },
      }, tx);

      return updated;
    });
  }

  async close(id: string, actor: ActorContext) {
    if (!['QMS', 'MR', 'IT'].includes(actor.role)) {
      throw new ForbiddenError('Only QMS/MR/IT can close monthly KPI');
    }

    const row = await this.getById(id);
    if (row.approvalStatus !== KpiApprovalStatus.REVIEWED && row.approvalStatus !== KpiApprovalStatus.VERIFIED) {
      throw new ConflictError('Only approved monthly record can be closed');
    }

    return db.$transaction(async (tx) => {
      const updated = await this.monthlyRepo.update(id, {
        approvalStatus: KpiApprovalStatus.VERIFIED,
        status: row.status === KpiMonthlyStatus.PENDING ? KpiMonthlyStatus.OK : row.status,
        closedAt: new Date(),
      }, tx);

      await this.auditRepo.logEvent({
        kpiMonthlyResultId: row.id,
        actorUserId: actor.userId,
        action: KpiWorkflowAction.CLOSE,
        beforeJson: { approvalStatus: row.approvalStatus },
        afterJson: { approvalStatus: KpiApprovalStatus.VERIFIED },
      }, tx);

      return updated;
    });
  }
}
