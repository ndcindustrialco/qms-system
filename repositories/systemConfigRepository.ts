import { BaseRepository } from "./baseRepository";
import { SystemConfig, Prisma } from "@/generated/prisma/client";

export class SystemConfigRepository extends BaseRepository<SystemConfig> {
  constructor() {
    super("systemConfig");
  }

  async findValueByKey(configKey: string, tx?: Prisma.TransactionClient): Promise<string | null> {
    const row = await this.getModel(tx).findUnique({
      where: { configKey },
      select: { configValue: true },
    });
    return row?.configValue ?? null;
  }

  async upsertConfig(
    configKey: string,
    configValue: string,
    description?: string,
    tx?: Prisma.TransactionClient
  ): Promise<SystemConfig> {
    return this.getModel(tx).upsert({
      where: { configKey },
      update: { configValue },
      create: { configKey, configValue, description },
    });
  }
}
