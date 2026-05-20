import { prisma } from "@/lib/db";
import type { UserWithDept } from "@/types/user";
import type { GraphUser } from "@/services/ms-graph";

export async function getAllUsers(): Promise<UserWithDept[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      role: true,
      msUserId: true,
      department: { select: { id: true, name: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));
}

export interface SyncResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: { email: string; message: string }[];
}

/**
 * Upsert all M365-licensed Entra ID users into the local database.
 *
 * Strategy:
 *   1. Collect unique department names → bulk-upsert departments first
 *   2. Upsert each user by email (primary unique key)
 *      - On create: role defaults to USER
 *      - On update: name, msUserId, employeeId, jobTitle, departmentId are refreshed
 *   3. Users with no valid email are skipped and recorded in errors[]
 */
export async function syncEntraUsers(entraUsers: GraphUser[]): Promise<SyncResult> {
  const result: SyncResult = { total: entraUsers.length, created: 0, updated: 0, skipped: 0, errors: [] };

  // Step 1: resolve department names → IDs
  const deptNames = [
    ...new Set(entraUsers.map((u) => u.department?.trim()).filter(Boolean) as string[]),
  ];

  const deptMap = new Map<string, string>();

  if (deptNames.length > 0) {
    await Promise.all(
      deptNames.map(async (name) => {
        const dept = await prisma.department.upsert({
          where: { name },
          update: {},
          create: { name },
          select: { id: true, name: true },
        });
        deptMap.set(dept.name, dept.id);
      }),
    );
  }

  // Step 2: upsert users
  for (const entraUser of entraUsers) {
    const email = (entraUser.mail ?? entraUser.userPrincipalName)?.toLowerCase().trim();

    if (!email) {
      result.skipped++;
      result.errors.push({ email: entraUser.userPrincipalName, message: "No email address" });
      continue;
    }

    const departmentId = entraUser.department?.trim()
      ? (deptMap.get(entraUser.department.trim()) ?? null)
      : null;

    try {
      const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

      await prisma.user.upsert({
        where: { email },
        create: {
          email,
          name: entraUser.displayName,
          msUserId: entraUser.id,
          employeeId: entraUser.employeeId ?? null,
          role: "USER",
          departmentId,
        },
        update: {
          name: entraUser.displayName,
          msUserId: entraUser.id,
          employeeId: entraUser.employeeId ?? null,
          departmentId,
        },
      });

      if (existing) {
        result.updated++;
      } else {
        result.created++;
      }
    } catch (err) {
      result.skipped++;
      result.errors.push({
        email,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return result;
}
