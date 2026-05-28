import { db } from '@/lib/db';
import { DocumentControlRepository } from '@/repositories/documentControlRepository';
import { NotFoundError, ValidationError } from '@/lib/errors';
import {
  uploadFileToDocControl,
  deleteSpItem,
  renameSpItem,
  ensureSpFolder,
  moveSpFolderByPath,
  deleteSpFolderByPath,
  buildDocControlCategoryFolderPath,
  buildDocControlDocumentFolderPath,
} from '@/services/sharepoint';
import type { CreateDocumentControlInput, UpdateDocumentControlInput } from '@/types/documentControl';
import { Prisma } from '@/generated/prisma/client';

export class DocumentControlService {
  private repo = new DocumentControlRepository();

  async listDocuments(
    page: number,
    limit: number,
    filters?: { search?: string; categoryId?: string; status?: string; sortBy?: string; sortOrder?: string },
  ) {
    const where: Prisma.DocumentControlWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { docNumber: { contains: filters.search, mode: 'insensitive' } },
        { docName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.status) {
      where.status = filters.status as any;
    }

    return this.repo.findManyWithUsers(
      { page, limit, sortBy: filters?.sortBy, sortOrder: filters?.sortOrder },
      where
    );
  }

  async getDocument(id: string) {
    const doc = await this.repo.findDetailById(id);
    if (!doc) {
      throw new NotFoundError('Document');
    }
    return this._formatDocDetail(doc);
  }

  async createDocument(userId: string, data: CreateDocumentControlInput) {
    const existing = await this.repo.findByDocNumber(data.docNumber);
    if (existing) {
      throw new ValidationError('Document number already exists');
    }

    const [dept, category] = await Promise.all([
      db.department.findUnique({ where: { id: data.departmentId }, select: { name: true } }),
      db.documentCategory.findUnique({ where: { id: data.categoryId }, select: { name: true, departmentId: true } }),
    ]);
    if (!dept || !category) throw new ValidationError('Department or category not found');
    if (category.departmentId !== data.departmentId) throw new ValidationError('Category does not belong to department');
    const docFolderPath = buildDocControlDocumentFolderPath(dept.name, category.name, data.docNumber);
    await ensureSpFolder(docFolderPath);

    const doc = await this.repo.create({
      docNumber: data.docNumber,
      docName: data.docName,
      description: data.description ?? null,
      status: (data.status || 'DRAFT') as any,
      departmentId: data.departmentId,
      categoryId: data.categoryId,
      createdById: userId,
      revision: null,
      spFolderPath: docFolderPath,
    } as any);

    return this._formatDocDetail(doc);
  }

  async updateDocument(id: string, userId: string, data: UpdateDocumentControlInput) {
    const doc = await this.repo.findDetailById(id);
    if (!doc) {
      throw new NotFoundError('Document');
    }

    const updates: any = { updatedById: userId };
    const nextDepartmentId = data.departmentId ?? doc.departmentId ?? undefined;
    const nextCategoryId = data.categoryId ?? doc.categoryId ?? undefined;
    if (!nextDepartmentId || !nextCategoryId) throw new ValidationError('Department and category are required');

    const [nextDept, nextCategory] = await Promise.all([
      db.department.findUnique({ where: { id: nextDepartmentId }, select: { name: true } }),
      db.documentCategory.findUnique({ where: { id: nextCategoryId }, select: { name: true, departmentId: true } }),
    ]);
    if (!nextDept || !nextCategory) throw new ValidationError('Department or category not found');
    if (nextCategory.departmentId !== nextDepartmentId) throw new ValidationError('Category does not belong to department');

    const currentDeptName = (doc as any).department?.name ?? 'Unknown';
    const currentCategoryName = (doc as any).category?.name ?? 'Uncategorized';
    const oldDocFolderPath = buildDocControlDocumentFolderPath(currentDeptName, currentCategoryName, doc.docNumber);
    const newDocFolderPath = buildDocControlDocumentFolderPath(nextDept.name, nextCategory.name, doc.docNumber);
    if (oldDocFolderPath !== newDocFolderPath) {
      const targetParentPath = buildDocControlCategoryFolderPath(nextDept.name, nextCategory.name);
      await moveSpFolderByPath({
        sourceFolderPath: oldDocFolderPath,
        targetParentPath,
        newFolderName: doc.docNumber,
      });
      updates.spFolderPath = newDocFolderPath;

      const revisions = await db.documentControlRevision.findMany({
        where: { documentControlId: id },
        select: { id: true, revision: true },
      });
      for (const rev of revisions) {
        await db.documentControlRevision.update({
          where: { id: rev.id },
          data: { spFolderPath: buildDocControlDocumentFolderPath(nextDept.name, nextCategory.name, doc.docNumber, rev.revision) },
        });
      }
    }

    if (data.docName !== undefined && data.docName !== doc.docName && doc.spItemId && doc.fileName) {
      const extMatch = doc.fileName.match(/(\.[^./\\]+)$/);
      const ext = extMatch ? extMatch[1] : '';
      const safeBaseName = data.docName.replace(/[/\\:*?"<>|]/g, '_').trim();
      if (!safeBaseName) {
        throw new ValidationError('Document name is invalid');
      }

      const renamed = await renameSpItem({
        spItemId: doc.spItemId,
        newName: `${safeBaseName}${ext}`,
      });
      updates.fileName = renamed.name;
      updates.spWebUrl = renamed.spWebUrl;
      updates.spDownloadUrl = renamed.spDownloadUrl;
    }

    if (data.docName !== undefined) updates.docName = data.docName;
    if (data.description !== undefined) updates.description = data.description;
    if (data.status !== undefined) updates.status = data.status;
    if (data.departmentId !== undefined) updates.departmentId = data.departmentId;
    if (data.categoryId !== undefined) updates.categoryId = data.categoryId;

    const updated = await this.repo.update(id, updates);
    return this._formatDocDetail(updated);
  }

  async addRevision(
    id: string,
    userId: string,
    data: { revision: string; effectiveDate?: string | null; status?: any },
    file: { buffer: Uint8Array; name: string; type: string },
  ) {
    const doc = await this.repo.findDetailById(id);
    if (!doc) {
      throw new NotFoundError('Document');
    }

    // Resolve dept + category names for SharePoint path
    const deptName = (doc as any).department?.name ?? 'Unknown';
    const categoryName = (doc as any).category?.name ?? 'Uncategorized';

    // 1. Mark existing revisions as OBSOLETE
    await db.documentControlRevision.updateMany({
      where: { documentControlId: id },
      data: { status: 'OBSOLETE' },
    });

    // 2. Upload file to SharePoint
    const spResult = await uploadFileToDocControl({
      fileBuffer: file.buffer,
      fileName: file.name,
      mimeType: file.type,
      deptName,
      categoryName,
      docNumber: doc.docNumber,
      revision: data.revision,
    });

    // 3. Create new DocumentControlRevision
    const revisionStatus = data.status || 'ACTIVE';
    await db.documentControlRevision.create({
      data: {
        documentControlId: id,
        revision: data.revision,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        status: revisionStatus,
        spDriveId: spResult.driveId,
        spItemId: spResult.spItemId,
        spWebUrl: spResult.spWebUrl,
        spDownloadUrl: spResult.spDownloadUrl,
        spFolderPath: spResult.folderPath,
        fileName: file.name,
        fileSize: file.buffer.length,
        mimeType: file.type,
        createdById: userId,
      },
    });

    // 4. Update main DocumentControl with latest revision info
    const updatedDoc = await this.repo.update(id, {
      revision: data.revision,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
      status: revisionStatus,
      spDriveId: spResult.driveId,
      spItemId: spResult.spItemId,
      spWebUrl: spResult.spWebUrl,
      spDownloadUrl: spResult.spDownloadUrl,
      spFolderPath: spResult.folderPath,
      fileName: file.name,
      fileSize: file.buffer.length,
      mimeType: file.type,
      updatedById: userId,
    });

    return this._formatDocDetail(updatedDoc);
  }

  async deleteDocument(id: string) {
    const doc = await this.repo.findDetailById(id);
    if (!doc) {
      throw new NotFoundError('Document');
    }

    if (doc.spFolderPath) {
      await deleteSpFolderByPath(doc.spFolderPath);
    } else if (doc.spItemId) {
      try {
        await deleteSpItem(doc.spItemId);
      } catch {
        // Continue even if SP delete fails
      }
    }

    return this.repo.delete(id);
  }

  private _formatDocDetail(doc: any) {
    return {
      ...doc,
      createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
      updatedAt: doc.updatedAt?.toISOString?.() ?? doc.updatedAt,
      effectiveDate: doc.effectiveDate?.toISOString?.() ?? doc.effectiveDate,
    };
  }
}
