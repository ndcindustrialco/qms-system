import { KpiMaster, KpiObjectiveStatus, Prisma } from '@/generated/prisma/client';
import { BaseRepository, PaginatedResult, PaginationParams } from '@/repositories/baseRepository';
import { ObjectiveWorkflowUpdateDTO } from '@/types/kpiWorkflow';

export class KpiObjectiveRepository extends BaseRepository<KpiMaster, Prisma.KpiMasterCreateInput, Prisma.KpiMasterUpdateInput> {
  constructor() {
    super('kpiMaster');
  }

  async paginateObjectives(
    params: PaginationParams,
    where: Prisma.KpiMasterWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PaginatedResult<KpiMaster>> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;
    const model = this.getModel(tx);

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { department: true, approvedBy: true },
      }),
      model.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async findObjectiveById(id: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findUnique({
      where: { id },
      include: { department: true, approvedBy: true },
    });
  }

  async updateWorkflow(id: string, payload: ObjectiveWorkflowUpdateDTO, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).update({
      where: { id },
      data: payload,
    });
  }

  async listApprovedForPeriod(year: number, departmentId?: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findMany({
      where: {
        year,
        objectiveStatus: KpiObjectiveStatus.APPROVED,
        ...(departmentId ? { departmentId } : {}),
      },
    });
  }
}
