import { BaseRepository } from '@/repositories/baseRepository';
import { DocumentCategory, Prisma } from '@/generated/prisma/client';

export class DocumentCategoryRepository extends BaseRepository<DocumentCategory> {
  constructor() {
    super('documentCategory');
  }

  async listByDepartment(departmentId: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findMany({
      where: { departmentId },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { documents: true } },
      },
    });
  }

  async findByIdWithCount(id: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { documents: true } },
      },
    });
  }

  async hasDocuments(id: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const count = await this.getModel(tx).count({
      where: { id, documents: { some: {} } },
    });
    return count > 0;
  }
}
