import { Prisma, KpiMaster } from '@/generated/prisma/client';
import { BaseRepository, PaginationParams, PaginatedResult } from '@/repositories/baseRepository';
import { CreateKpiMasterDTO, UpdateKpiMasterDTO } from '@/types/kpiMaster';

export class KpiMasterRepository extends BaseRepository<KpiMaster, CreateKpiMasterDTO, UpdateKpiMasterDTO> {
  constructor() {
    super('kpiMaster');
  }

  // Override paginate to include department relation
  async paginate(
    params: PaginationParams,
    where: any = {},
    orderBy: any = { createdAt: 'desc' },
    tx?: Prisma.TransactionClient
  ): Promise<PaginatedResult<KpiMaster>> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const model = this.getModel(tx);

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          department: true,
        },
      }),
      model.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  // Override findById to include department relation
  async findById(id: string, tx?: Prisma.TransactionClient): Promise<KpiMaster | null> {
    return this.getModel(tx).findUnique({
      where: { id },
      include: {
        department: true,
      },
    });
  }
}
