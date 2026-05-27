
import { type NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { DepartmentService } from "@/services/departmentService";
import { sendSuccess } from "@/lib/apiResponse";
import { handleApiError } from "@/lib/apiErrorHandler";
import { NotFoundError } from "@/errors/customErrors";

const deptService = new DepartmentService();

type Params = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  { params }: Params,
) {
  try {
    await requireRole("IT");
    const { id } = await params;
    const dept = await deptService.getDepartmentWithMembers(id);
    if (!dept) {
      throw new NotFoundError("ไม่พบแผนก");
    }
    return sendSuccess(dept, "Department members retrieved successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
