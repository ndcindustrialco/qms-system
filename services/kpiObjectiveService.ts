import { ConflictError, ForbiddenError, NotFoundError } from '@/errors/customErrors';
import { KpiObjectiveStatus } from '@/generated/prisma/client';
import { KpiObjectiveRepository } from '@/repositories/kpiObjectiveRepository';
import { ActorContext, ListObjectiveQuery } from '@/types/kpiWorkflow';

export class KpiObjectiveService {
  private repo = new KpiObjectiveRepository();

  async list(query: ListObjectiveQuery) {
    const where = {
      ...(query.year ? { year: query.year } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.search
        ? { objectiveDetails: { contains: query.search, mode: 'insensitive' as const } }
        : {}),
    };

    return this.repo.paginateObjectives({ page: query.page, limit: query.limit }, where);
  }

  async getById(id: string) {
    const objective = await this.repo.findObjectiveById(id);
    if (!objective) throw new NotFoundError(`KPI objective ${id} not found`);
    return objective;
  }

  async createDraft(data: {
    year: number;
    objectiveDetails: string;
    measurementFrequency?: string;
    calculationFormula?: string;
    guidelines?: string;
    trackingRecords?: string;
    targetValue: number;
    departmentId: string;
  }, actor: ActorContext) {
    if (actor.role === 'USER' && actor.departmentId !== data.departmentId) {
      throw new ForbiddenError('Cannot create objective for another department');
    }

    const { departmentId, ...rest } = data;
    return this.repo.create({
      ...rest,
      department: { connect: { id: departmentId } },
      objectiveStatus: KpiObjectiveStatus.DRAFT,
      createdById: actor.userId,
    });
  }

  async updateDraft(id: string, data: Partial<{
    objectiveDetails: string;
    measurementFrequency: string;
    calculationFormula: string;
    guidelines: string;
    trackingRecords: string;
    targetValue: number;
  }>, actor: ActorContext) {
    const objective = await this.getById(id);

    if (objective.objectiveStatus !== KpiObjectiveStatus.DRAFT && objective.objectiveStatus !== KpiObjectiveStatus.REJECTED) {
      throw new ConflictError('Only draft/rejected objective can be edited');
    }

    if (actor.role === 'USER' && actor.departmentId !== objective.departmentId) {
      throw new ForbiddenError('Cannot edit another department objective');
    }

    return this.repo.update(id, data);
  }

  async submit(id: string, actor: ActorContext) {
    const objective = await this.getById(id);
    if (objective.objectiveStatus !== KpiObjectiveStatus.DRAFT && objective.objectiveStatus !== KpiObjectiveStatus.REJECTED) {
      throw new ConflictError('Only draft/rejected objective can be submitted');
    }
    if (actor.role === 'USER' && actor.departmentId !== objective.departmentId) {
      throw new ForbiddenError('Cannot submit another department objective');
    }

    return this.repo.updateWorkflow(id, {
      objectiveStatus: KpiObjectiveStatus.PENDING_APPROVAL,
      approvedAt: null,
      approvedById: null,
    });
  }

  async approve(id: string, actor: ActorContext) {
    const objective = await this.getById(id);
    if (!['QMS', 'MR', 'IT'].includes(actor.role)) {
      throw new ForbiddenError('Only approver roles can approve objective');
    }
    if (objective.objectiveStatus !== KpiObjectiveStatus.PENDING_APPROVAL) {
      throw new ConflictError('Objective must be pending approval');
    }

    return this.repo.updateWorkflow(id, {
      objectiveStatus: KpiObjectiveStatus.APPROVED,
      approvedAt: new Date(),
      approvedById: actor.userId,
    });
  }

  async reject(id: string, actor: ActorContext) {
    const objective = await this.getById(id);
    if (!['QMS', 'MR', 'IT'].includes(actor.role)) {
      throw new ForbiddenError('Only approver roles can reject objective');
    }
    if (objective.objectiveStatus !== KpiObjectiveStatus.PENDING_APPROVAL) {
      throw new ConflictError('Objective must be pending approval');
    }

    return this.repo.updateWorkflow(id, {
      objectiveStatus: KpiObjectiveStatus.REJECTED,
      approvedAt: null,
      approvedById: null,
    });
  }
}
