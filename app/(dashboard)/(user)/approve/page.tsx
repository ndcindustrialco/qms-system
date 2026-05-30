import { requireAuth } from "@/lib/auth";
import ApprovePageClient from "@/components/approve/ApprovePageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approve",
};

export default async function ApprovePage() {
  const session = await requireAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <ApprovePageClient userRole={session.user.role} />
    </div>
  );
}
