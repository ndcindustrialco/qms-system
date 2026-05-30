import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { ForbiddenError } from "@/errors/customErrors";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ApprovalConfigClient from "@/components/qms/ApprovalConfigClient";

export const metadata: Metadata = {
  title: "DAR Approver Configuration",
};

export default async function QmsApprovalConfigPage() {
  try {
    await requireRole("QMS", "IT", "MR");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/unauthorized?reason=insufficient_role");
    throw e;
  }

  const [users, mrConfig, qmsConfig] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }, { email: "asc" }],
    }),
    db.systemConfig.findUnique({ where: { configKey: "CURRENT_MR_USER_ID" } }),
    db.systemConfig.findUnique({ where: { configKey: "CURRENT_QMS_USER_ID" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <ApprovalConfigClient
        users={users}
        currentMrUserId={mrConfig?.configValue ?? null}
        currentQmsUserId={qmsConfig?.configValue ?? null}
      />
    </div>
  );
}

