import { BaseRepository, type PaginatedResult } from '@/repositories/baseRepository';
import { DocumentControl, Prisma } from '@/generated/prisma/client';

const DOC_INCLUDE = {
  createdBy: { select: { id: true, name: true } },
  updatedBy: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
  category: { select: { id: true, name: true, departmentId: true } },
  revisions: {
    include: {
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
};

export class DocumentControlRepository extends BaseRepository<DocumentControl> {
  constructor() {
    super('documentControl');
  }

  async findManyWithUsers(
    params: { page: number; limit: number; sortBy?: string; sortOrder?: string },
    where: Prisma.DocumentControlWhereInput = {},
    tx?: Prisma.TransactionClient,
  ): Promise<PaginatedResult<any>> {
    const skip = (params.page - 1) * params.limit;
    const model = this.getModel(tx);

    const order: any = {};
    if (params.sortBy) {
      order[params.sortBy] = params.sortOrder || 'desc';
    } else {
      order.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        include: DOC_INCLUDE,
        orderBy: order,
        skip,
        take: params.limit,
      }),
      model.count({ where }),
    ]);

    return {
      data,
      meta: { page: params.page, limit: params.limit, total },
    };
  }

  async findDetailById(id: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findUnique({
      where: { id },
      include: DOC_INCLUDE,
    });
  }

  async findByDocNumber(docNumber: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findUnique({
      where: { docNumber },
      include: DOC_INCLUDE,
    });
  }
}
