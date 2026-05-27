
import { type NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { DepartmentService } from "@/services/departmentService";
import { sendSuccess } from "@/lib/apiResponse";
import { handleApiError } from "@/lib/apiErrorHandler";

const deptService = new DepartmentService();

const createSchema = z.object({
  name: z.string().min(1, "ชื่อแผนกต้องไม่ว่างเปล่า").max(100),
  emailGroup: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireRole("IT");
    const departments = await deptService.getAllDepartments();
    return sendSuccess(departments, "Departments retrieved successfully");
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("IT");
    const body = await req.json();
    const validated = createSchema.parse(body);
    const dept = await deptService.createDepartment(validated);
    return sendSuccess(dept, "Department created successfully", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
