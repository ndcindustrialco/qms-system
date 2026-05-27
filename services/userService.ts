import { UserRepository } from "@/repositories/userRepository";
import { DepartmentRepository } from "@/repositories/departmentRepository";
import type { UserWithDept } from "@/types/user";
import type { GraphUser } from "@/services/ms-graph";
import type { UserRole } from "@/generated/prisma/client";

export class UserService {
  private userRepo = new UserRepository();
  private deptRepo = new DepartmentRepository();

  async getAllUsers(): Promise<UserWithDept[]> {
    const rows = await this.userRepo.findManyWithDept();
    return (rows as Array<{
      id: string;
      name: string | null;
      email: string;
      employeeId: string | null;
      role: UserRole;
      msUserId: string | null;
      department: { id: string; name: string } | null;
      createdAt: Date;
    }>).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      employeeId: u.employeeId,
      role: u.role,
      msUserId: u.msUserId,
      department: u.department ?? null,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async syncEntraUsers(entraUsers: GraphUser[]) {
    const result = {
      total: entraUsers.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as { email: string; message: string }[]
    };

    const deptNames = [...new Set(entraUsers.map((u) => u.department?.trim()).filter(Boolean) as string[])];
    const deptMap = new Map<string, string>();

    if (deptNames.length > 0) {
      await Promise.all(
        deptNames.map(async (name) => {
          const dept = await this.deptRepo.upsertDepartment(name);
          deptMap.set(name, dept.id);
        })
      );
    }

    for (const entraUser of entraUsers) {
      const email = (entraUser.mail ?? entraUser.userPrincipalName)?.toLowerCase().trim();

      if (!email) {
        result.skipped++;
        result.errors.push({ email: entraUser.userPrincipalName, message: "No email address" });
        continue;
      }

      const departmentId = entraUser.department?.trim() ? (deptMap.get(entraUser.department.trim()) ?? null) : null;

      try {
        const existing = await this.userRepo.findByEmail(email);

        if (existing) {
          await this.userRepo.update(existing.id, {
            name: entraUser.displayName,
            msUserId: entraUser.id,
            employeeId: entraUser.employeeId ?? null,
            departmentId,
          });
          result.updated++;
        } else {
          await this.userRepo.create({
            email,
            name: entraUser.displayName,
            msUserId: entraUser.id,
            employeeId: entraUser.employeeId ?? null,
            role: "USER",
            departmentId,
          });
          result.created++;
        }
      } catch (err) {
        result.skipped++;
        result.errors.push({ email, message: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    return result;
  }
}
