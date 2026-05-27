import { requireRole } from "@/lib/auth";
import { UserService } from "@/services/userService";
import { DepartmentService } from "@/services/departmentService";
import ItUserTable from "@/components/it/ItUserTable";
import SyncActions from "@/components/it/SyncActions";
import LocalizedEmptyState from "@/components/common/LocalizedEmptyState";
import PageHeader from "@/components/common/PageHeader";

const userService = new UserService();
const deptService = new DepartmentService();

export default async function ItUsersPage() {
  await requireRole("IT");
  const [users, departments] = await Promise.all([
    userService.getAllUsers(),
    deptService.getActiveDepartments()
  ]);

  return (
    <div className="max-w-350 mx-auto px-4 md:px-8">
      <PageHeader
        title="Manage Users"
        subtitle={`All users signed in via Microsoft 365 (${users.length})`}
        actions={<SyncActions />}
      />

      {users.length === 0 ? (
        <LocalizedEmptyState
          titleKey="emptyUsers"
          descriptionKey="emptyUsersDesc"
        />
      ) : (
        <ItUserTable users={users} departments={departments} />
      )}
    </div>
  );
}
