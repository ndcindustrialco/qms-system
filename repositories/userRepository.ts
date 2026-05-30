import { BaseRepository } from "./baseRepository";
import { User, Prisma, SignatureType, UserRole } from "@/generated/prisma/client";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super("user");
  }

  private delegate(tx?: Prisma.TransactionClient) {
    return this.getClient(tx).user;
  }

  async findByEmail(email: string, tx?: Prisma.TransactionClient): Promise<User | null> {
    return this.delegate(tx).findUnique({ where: { email } });
  }

  async findAssignees(tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findMany({
      where: { role: { in: ['QMS', 'MR', 'IT'] } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async findFirstByRole(role: 'USER' | 'IT' | 'QMS' | 'MR', tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findFirst({
      where: { role },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findManyWithDept(tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        role: true,
        msUserId: true,
        createdAt: true,
        department: { select: { id: true, name: true } },
      },
    });
  }

  async updateProfile(
    id: string,
    data: { name?: string; position?: string | null; savedSignatureUrl?: string | null; signatureType?: SignatureType | null },
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    return this.delegate(tx).update({ where: { id }, data });
  }

  async findByIds(
    ids: string[],
    select: Prisma.UserSelect = { id: true, name: true, email: true },
    tx?: Prisma.TransactionClient
  ) {
    return this.delegate(tx).findMany({ where: { id: { in: ids } }, select });
  }

  async findByRole(role: UserRole, tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findMany({
      where: { role },
      orderBy: { name: 'asc' },
    });
  }

  async findByDepartment(departmentId: string, tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findMany({
      where: { departmentId },
      orderBy: { name: 'asc' },
    });
  }

  async updateRole(id: string, role: UserRole, tx?: Prisma.TransactionClient): Promise<User> {
    return this.delegate(tx).update({ where: { id }, data: { role } });
  }

  async saveSignature(
    id: string,
    data: { savedSignatureUrl: string; signatureType: SignatureType },
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    return this.delegate(tx).update({ where: { id }, data });
  }

  async upsertUser(
    email: string,
    data: Prisma.UserUncheckedCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    return this.delegate(tx).upsert({
      where: { email },
      update: {
        name: data.name,
        msUserId: data.msUserId,
        employeeId: data.employeeId,
        departmentId: data.departmentId,
        image: data.image,
      },
      create: data,
    });
  }

  async findByMsUserIds(msUserIds: string[], tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findMany({
      where: { msUserId: { in: msUserIds } },
      select: { id: true, msUserId: true },
    });
  }

  async findForM365Push(id: string, tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findUnique({
      where: { id },
      select: {
        msUserId: true,
        name: true,
        employeeId: true,
        department: { select: { name: true } },
      },
    });
  }

  async findAllForApprovalConfig(tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }, { email: "asc" }],
    });
  }

  async countByIds(ids: string[], tx?: Prisma.TransactionClient): Promise<number> {
    return this.delegate(tx).count({ where: { id: { in: ids } } });
  }

  async updateAttributes(
    id: string,
    data: Prisma.UserUpdateInput,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    return this.delegate(tx).update({ where: { id }, data });
  }
}
