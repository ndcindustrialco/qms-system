import { Metadata } from "next";
import { DepartmentService } from "@/services/departmentService";
import { auth } from "@/lib/auth";
import KpiClient from "../../../../components/kpi/KpiClient";

export const metadata: Metadata = {
  title: "KPI",
  description: "Manage QMS KPI Master references",
};

export default async function KpiPage() {
  const session = await auth();
  const canEdit = ["QMS", "MR", "IT"].includes(session?.user?.role ?? "");

  const deptService = new DepartmentService();
  const departments = await deptService.getActiveDepartments();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <KpiClient departments={departments} canEdit={canEdit} />
    </div>
  );
}

