import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export abstract class BaseRepository<T, CreateDTO = any, UpdateDTO = any> {
  constructor(protected modelName: Uncapitalize<Prisma.ModelName>) {}

  protected getClient(tx?: Prisma.TransactionClient) {
    return tx || db;
  }

  protected getModel(tx?: Prisma.TransactionClient) {
    const client = this.getClient(tx);
    return (client as any)[this.modelName];
  }

  async paginate(
    params: PaginationParams,
    where: any = {},
    orderBy: any = { createdAt: "desc" },
    tx?: Prisma.TransactionClient
  ): Promise<PaginatedResult<T>> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const model = this.getModel(tx);

    const [data, total] = await Promise.all([
      model.findMany({ where, orderBy, skip, take: limit }),
      model.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<T | null> {
    return this.getModel(tx).findUnique({ where: { id } });
  }

  async create(data: CreateDTO, tx?: Prisma.TransactionClient): Promise<T> {
    return this.getModel(tx).create({ data });
  }

  async update(id: string, data: UpdateDTO, tx?: Prisma.TransactionClient): Promise<T> {
    return this.getModel(tx).update({ where: { id }, data });
  }

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<T> {
    return this.getModel(tx).delete({ where: { id } });
  }
}
