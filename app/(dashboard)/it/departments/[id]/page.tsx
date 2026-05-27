import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { DepartmentService } from "@/services/departmentService";
import DepartmentDetailClient from "@/components/it/DepartmentDetailClient";

const deptService = new DepartmentService();

type Props = { params: Promise<{ id: string }> };

export default async function DepartmentDetailPage({ params }: Props) {
  await requireRole("IT");
  const { id } = await params;
  const dept = await deptService.getDepartmentWithMembers(id);
  if (!dept) notFound();

  return <DepartmentDetailClient dept={dept} />;
}
