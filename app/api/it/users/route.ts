
import { requireRole } from "@/lib/auth";
import { UserService } from "@/services/userService";
import { sendSuccess } from "@/lib/apiResponse";
import { handleApiError } from "@/lib/apiErrorHandler";

const userService = new UserService();

/**
 * GET /api/it/users
 *
 * Returns all users in the database with their department.
 * Restricted to IT role.
 */
export async function GET() {
  try {
    await requireRole("IT");

    const users = await userService.getAllUsers();
    return sendSuccess(users, "Users retrieved successfully");
  } catch (err) {
    return handleApiError(err);
  }
}
