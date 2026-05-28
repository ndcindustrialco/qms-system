import { KpiMonthlyResult, Prisma } from '@/generated/prisma/client';
import { BaseRepository, PaginatedResult } from '@/repositories/baseRepository';
import { ListMonthlyQuery, UpdateMonthlyDraftDTO } from '@/types/kpiWorkflow';

export class KpiMonthlyRepository extends BaseRepository<KpiMonthlyResult, Prisma.KpiMonthlyResultCreateInput, Prisma.KpiMonthlyResultUpdateInput> {
  constructor() {
    super('kpiMonthlyResult');
  }

  async paginateMonthly(query: ListMonthlyQuery, tx?: Prisma.TransactionClient): Promise<PaginatedResult<KpiMonthlyResult>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const where: Prisma.KpiMonthlyResultWhereInput = {
      ...(query.year ? { periodYear: query.year } : {}),
      ...(query.month ? { month: query.month } : {}),
      ...(query.approvalStatus ? { approvalStatus: query.approvalStatus } : {}),
      ...(query.departmentId ? { kpiMaster: { departmentId: query.departmentId } } : {}),
    };

    const model = this.getModel(tx);
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ periodYear: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
        include: {
          kpiMaster: { include: { department: true } },
          attachments: true,
          signatures: true,
        },
      }),
      model.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async findByIdWithRelations(id: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findUnique({
      where: { id },
      include: {
        kpiMaster: { include: { department: true } },
        attachments: true,
        signatures: true,
      },
    });
  }

  async createIfNotExists(data: {
    kpiMasterId: string;
    periodYear: number;
    month: number;
  }, tx?: Prisma.TransactionClient) {
    const model = this.getModel(tx);
    const existing = await model.findFirst({
      where: {
        kpiMasterId: data.kpiMasterId,
        periodYear: data.periodYear,
        month: data.month,
      },
    });

    if (existing) return existing;

    return model.create({
      data: {
        kpiMasterId: data.kpiMasterId,
        periodYear: data.periodYear,
        month: data.month,
      },
    });
  }

  async updateDraft(id: string, payload: UpdateMonthlyDraftDTO, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).update({
      where: { id },
      data: payload,
    });
  }
}
