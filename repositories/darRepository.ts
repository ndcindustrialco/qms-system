import { BaseRepository } from "./baseRepository";
import { DarMaster, Prisma } from "@/generated/prisma/client";

export class DarRepository extends BaseRepository<DarMaster> {
  constructor() {
    super("darMaster");
  }

  private delegate(tx?: Prisma.TransactionClient) {
    return this.getClient(tx).darMaster;
  }

  async findDetailById(id: string, tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findUnique({
      where: { id },
      include: {
        requester: { include: { department: true } },
        items: { orderBy: { itemNo: "asc" } },
        distributions: { include: { department: true } },
        approvals: {
          orderBy: { id: "asc" },
          include: { assignedUser: { include: { department: true } } },
        },
        attachments: {
          orderBy: { createdAt: "asc" },
          include: { uploadedBy: true },
        },
        qmsProcessing: true,
      },
    });
  }

  async findManySummary(take = 200, tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: { _count: { select: { items: true } } },
    });
  }

  async findManyByRequester(
    requesterId: string,
    skip: number,
    take: number,
    tx?: Prisma.TransactionClient
  ) {
    return this.delegate(tx).findMany({
      where: { requesterId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { _count: { select: { items: true } } },
    });
  }

  async countByRequester(requesterId: string, tx?: Prisma.TransactionClient): Promise<number> {
    return this.delegate(tx).count({ where: { requesterId } });
  }

  // --- DarItem Operations ---
  async deleteItemsByDarId(darMasterId: string, tx: Prisma.TransactionClient) {
    return tx.darItem.deleteMany({ where: { darMasterId } });
  }

  async createItems(items: Prisma.DarItemCreateManyInput[], tx: Prisma.TransactionClient) {
    return tx.darItem.createMany({ data: items });
  }

  // --- DarDistribution Operations ---
  async deleteDistributionsByDarId(darMasterId: string, tx: Prisma.TransactionClient) {
    return tx.darDistribution.deleteMany({ where: { darMasterId } });
  }

  async createDistributions(
    distributions: Prisma.DarDistributionCreateManyInput[],
    tx: Prisma.TransactionClient
  ) {
    return tx.darDistribution.createMany({ data: distributions });
  }

  // --- DarApproval Operations ---
  async findApprovalsByDarId(darMasterId: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).darApproval.findMany({
      where: { darMasterId },
      orderBy: { id: "asc" },
      select: { id: true, stepRole: true, action: true, assignedUserId: true },
    });
  }

  async findPendingApproval(darMasterId: string, userId: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).darApproval.findFirst({
      where: { darMasterId, assignedUserId: userId, action: "PENDING" },
    });
  }

  async countPendingApprovalsByUser(userId: string, tx?: Prisma.TransactionClient): Promise<number> {
    return this.getClient(tx).darApproval.count({
      where: { assignedUserId: userId, action: "PENDING" },
    });
  }

  async findPendingApprovalsByUser(userId: string, take = 10, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).darApproval.findMany({
      where: { assignedUserId: userId, action: "PENDING" },
      orderBy: { darMaster: { createdAt: "desc" } },
      take,
      include: {
        darMaster: {
          select: {
            id: true,
            darNo: true,
            status: true,
            requestDate: true,
            requester: { select: { name: true } },
          },
        },
      },
    });
  }

  async createApproval(data: Prisma.DarApprovalUncheckedCreateInput, tx: Prisma.TransactionClient) {
    return tx.darApproval.create({ data });
  }

  async updateApproval(id: string, data: Prisma.DarApprovalUpdateInput, tx: Prisma.TransactionClient) {
    return tx.darApproval.update({ where: { id }, data });
  }

  async deleteApprovalsByDarId(darMasterId: string, tx: Prisma.TransactionClient) {
    return tx.darApproval.deleteMany({ where: { darMasterId } });
  }

  async deleteApprovalsByDarIdExceptPreparer(darMasterId: string, tx: Prisma.TransactionClient) {
    return tx.darApproval.deleteMany({
      where: { darMasterId, stepRole: { not: "PREPARER" } },
    });
  }

  // --- DarAttachment Operations ---
  async findAttachmentsByDarId(darMasterId: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).darAttachment.findMany({
      where: { darMasterId },
      select: { spItemId: true },
    });
  }

  async createAttachments(
    attachments: Prisma.DarAttachmentCreateManyInput[],
    tx: Prisma.TransactionClient
  ) {
    return tx.darAttachment.createMany({ data: attachments });
  }

  async deleteAttachmentsByDarId(darMasterId: string, tx: Prisma.TransactionClient) {
    return tx.darAttachment.deleteMany({ where: { darMasterId } });
  }

  async findAttachmentById(attachmentId: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).darAttachment.findUnique({
      where: { id: attachmentId },
      select: { id: true, spItemId: true, uploadedById: true, darMasterId: true },
    });
  }

  async deleteAttachmentById(attachmentId: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).darAttachment.delete({ where: { id: attachmentId } });
  }

  async createAttachment(
    data: Prisma.DarAttachmentUncheckedCreateInput,
    tx?: Prisma.TransactionClient
  ) {
    return this.getClient(tx).darAttachment.create({ data });
  }

  async findDarForAttachmentUpload(darId: string, tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findUnique({
      where: { id: darId },
      select: {
        id: true, darNo: true, status: true, requesterId: true,
        objective: true, docType: true,
        department: { select: { name: true } },
        approvals: { select: { assignedUserId: true } },
      },
    });
  }

  async findDarStatusAndRequester(darId: string, tx?: Prisma.TransactionClient) {
    return this.delegate(tx).findUnique({
      where: { id: darId },
      select: { requesterId: true, status: true },
    });
  }

  async findAttachmentBySpItemId(spItemId: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).darAttachment.findFirst({
      where: { spItemId },
      select: { darMasterId: true },
    });
  }

  async findApprovalByDarAndUser(darMasterId: string, userId: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).darApproval.findFirst({
      where: { darMasterId, assignedUserId: userId },
      select: { id: true },
    });
  }
}
