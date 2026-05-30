import { UserRepository } from "@/repositories/userRepository";
import { SystemConfigRepository } from "@/repositories/systemConfigRepository";
import { db } from "@/lib/db";
import { ValidationError, NotFoundError, ForbiddenError } from "@/lib/errors";
import { Prisma } from "@/generated/prisma/client";

const MR_CONFIG_KEY = "CURRENT_MR_USER_ID";
const QMS_CONFIG_KEY = "CURRENT_QMS_USER_ID";

export class ApprovalConfigService {
  private userRepo = new UserRepository();
  private configRepo = new SystemConfigRepository();

  async getConfig() {
    const [users, mrConfig, qmsConfig] = await Promise.all([
      this.userRepo.findAllForApprovalConfig(),
      this.configRepo.findValueByKey(MR_CONFIG_KEY),
      this.configRepo.findValueByKey(QMS_CONFIG_KEY),
    ]);
    return { users, currentMrUserId: mrConfig, currentQmsUserId: qmsConfig };
  }

  async updateConfig(mrUserId: string | null, qmsUserId: string | null) {
    const ids = [mrUserId, qmsUserId].filter(Boolean) as string[];
    if (ids.length > 0) {
      const count = await this.userRepo.countByIds(ids);
      if (count !== ids.length) throw new ValidationError("Invalid selected user");
    }

    await db.$transaction(async (tx) => {
      if (mrUserId) {
        await this.configRepo.upsertConfigWithDescription(
          MR_CONFIG_KEY, mrUserId, "Designated MR user for DAR approvals", tx
        );
      } else {
        await this.configRepo.deleteByKey(MR_CONFIG_KEY, tx);
      }

      if (qmsUserId) {
        await this.configRepo.upsertConfigWithDescription(
          QMS_CONFIG_KEY, qmsUserId, "Designated QMS user for DAR final approvals", tx
        );
      } else {
        await this.configRepo.deleteByKey(QMS_CONFIG_KEY, tx);
      }
    });
  }

  async updateUserMrQmsRole(id: string, role: "USER" | "MR" | "QMS") {
    const existing = await this.userRepo.findById(id);
    if (!existing) throw new NotFoundError("User");

    const allowedRoles = ["USER", "MR", "QMS"];
    if (!allowedRoles.includes(existing.role)) {
      throw new ForbiddenError("Cannot change role for IT users via this endpoint");
    }

    const updated = await db.$transaction(async (tx) => {
      const user = await this.userRepo.updateAttributes(id, { role } as Prisma.UserUpdateInput, tx);

      if (role === "MR") {
        await this.configRepo.upsertConfigWithDescription(
          MR_CONFIG_KEY, id, "Designated MR user for DAR approvals", tx
        );
      } else if (existing.role === "MR") {
        await this.configRepo.deleteByKeyAndValue(MR_CONFIG_KEY, id, tx);
      }

      if (role === "QMS") {
        await this.configRepo.upsertConfigWithDescription(
          QMS_CONFIG_KEY, id, "Designated QMS user for DAR final approvals", tx
        );
      } else {
        await this.configRepo.deleteByKeyAndValue(QMS_CONFIG_KEY, id, tx);
      }

      return user;
    });

    return { id: updated.id, role: updated.role };
  }
}
