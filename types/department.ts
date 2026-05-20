export type DepartmentRow = {
  id: string;
  name: string;
  emailGroup: string | null;
  isActive: boolean;
  _count: { users: number };
  createdAt: string;
  updatedAt: string;
};
