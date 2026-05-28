import { KpiMonthlyAttachment, Prisma } from '@/generated/prisma/client';
import { BaseRepository } from '@/repositories/baseRepository';

export class KpiMonthlyAttachmentRepository extends BaseRepository<KpiMonthlyAttachment, Prisma.KpiMonthlyAttachmentCreateInput, Prisma.KpiMonthlyAttachmentUpdateInput> {
  constructor() {
    super('kpiMonthlyAttachment');
  }

  async listByRecordId(recordId: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findMany({
      where: { kpiMonthlyResultId: recordId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndRecordId(id: string, recordId: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findFirst({
      where: { id, kpiMonthlyResultId: recordId },
    });
  }
}
