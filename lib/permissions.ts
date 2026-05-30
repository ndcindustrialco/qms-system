import type { UserRole } from "@/generated/prisma/client";

export const PRIVILEGED_ROLES: UserRole[] = ["IT", "QMS", "MR"];

/**
 * ตรวจสอบว่า Role ปัจจุบันเป็นกลุ่มผู้มีสิทธิ์พิเศษ (Privileged) หรือไม่
 */
export function isPrivilegedRole(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return PRIVILEGED_ROLES.includes(role as UserRole);
}
