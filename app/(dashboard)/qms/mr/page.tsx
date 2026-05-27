
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ForbiddenError } from "@/errors/customErrors";
import { UserService } from "@/services/userService";
import MrManagementClient from "@/components/qms/MrManagementClient";

const userService = new UserService();

export default async function QmsMrPage() {
  try {
    await requireRole("QMS", "IT");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/unauthorized?reason=insufficient_role");
    throw e;
  }

  const users = await userService.getAllUsers();

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
      <MrManagementClient initialUsers={users} />
    </div>
  );
}
