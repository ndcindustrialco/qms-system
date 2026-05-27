import { BaseRepository } from "./baseRepository";
import { Announcement, Prisma } from "@/generated/prisma/client";

export class AnnouncementRepository extends BaseRepository<Announcement> {
  constructor() {
    super("announcement");
  }

  async findManyWithCreatedBy(tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { name: true } } },
    });
  }

  async findByIdWithCreatedBy(id: string, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).findUnique({
      where: { id },
      include: { createdBy: { select: { name: true } } },
    });
  }

  async findManyScrollingOrList(
    where: Prisma.AnnouncementWhereInput,
    take: number,
    tx?: Prisma.TransactionClient
  ) {
    return this.getModel(tx).findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
    });
  }
}
