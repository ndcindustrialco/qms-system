/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocumentCategoryRepository } from '@/repositories/documentCategoryRepository';
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/errors';
import type { CreateDocumentCategoryInput, UpdateDocumentCategoryInput } from '@/types/documentControl';
import { db } from '@/lib/db';
import {
  ensureSpFolder,
  moveSpFolderByPath,
  deleteSpFolderByPath,
  buildDocControlCategoryFolderPath,
  buildDocControlDocumentFolderPath,
} from '@/services/sharepoint';

export class DocumentCategoryService {
  private repo = new DocumentCategoryRepository();

  async listByDepartment(departmentId: string) {
    const categories = await this.repo.listByDepartment(departmentId);
    return categories.map((c: any) => this._format(c));
  }

  async getCategory(id: string) {
    const cat = await this.repo.findByIdWithCount(id);
    if (!cat) throw new NotFoundError('Category');
    return this._format(cat);
  }

  async createCategory(data: CreateDocumentCategoryInput) {
    const dept = await db.department.findUnique({ where: { id: data.departmentId }, select: { name: true } });
    if (!dept) throw new ValidationError('Department not found');
    await ensureSpFolder(buildDocControlCategoryFolderPath(dept.name, data.name));

    const cat = await this.repo.create({
      departmentId: data.departmentId,
      name: data.name,
      description: data.description ?? null,
      order: data.order ?? 0,
    } as any);
    return this._format(cat);
  }

  async updateCategory(id: string, data: UpdateDocumentCategoryInput) {
    const cat = await this.repo.findByIdWithCount(id);
    if (!cat) throw new NotFoundError('Category');

    const newName = data.name?.trim();
    if (newName && newName !== cat.name) {
      const deptName = cat.department?.name ?? 'Unknown';
      const oldCategoryPath = buildDocControlCategoryFolderPath(deptName, cat.name);
      const parentPath = buildDocControlCategoryFolderPath(deptName, '__tmp__').replace('/__tmp__', '');
      await moveSpFolderByPath({
        sourceFolderPath: oldCategoryPath,
        targetParentPath: parentPath,
        newFolderName: newName.replace(/[/\\:*?"<>|]/g, '_').trim(),
      });

      const docs = await db.documentControl.findMany({
        where: { categoryId: id },
        select: { id: true, docNumber: true, spFolderPath: true },
      });

      for (const doc of docs) {
        const newDocPath = buildDocControlDocumentFolderPath(deptName, newName, doc.docNumber);
        await db.documentControl.update({
          where: { id: doc.id },
          data: { spFolderPath: newDocPath },
        });

        const revisions = await db.documentControlRevision.findMany({
          where: { documentControlId: doc.id },
          select: { id: true, revision: true },
        });
        for (const rev of revisions) {
          await db.documentControlRevision.update({
            where: { id: rev.id },
            data: { spFolderPath: buildDocControlDocumentFolderPath(deptName, newName, doc.docNumber, rev.revision) },
          });
        }
      }
    }

    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.order !== undefined) updates.order = data.order;

    const updated = await this.repo.update(id, updates);
    return this._format(updated);
  }

  async deleteCategory(id: string) {
    const cat = await this.repo.findByIdWithCount(id);
    if (!cat) throw new NotFoundError('Category');

    const hasDocuments = await this.repo.hasDocuments(id);
    if (hasDocuments) {
      throw new ForbiddenError('Cannot delete category with linked documents');
    }

    const deptName = cat.department?.name ?? 'Unknown';
    await deleteSpFolderByPath(buildDocControlCategoryFolderPath(deptName, cat.name));
    return this.repo.delete(id);
  }

  private _format(cat: any) {
    return {
      ...cat,
      createdAt: cat.createdAt?.toISOString?.() ?? cat.createdAt,
      updatedAt: cat.updatedAt?.toISOString?.() ?? cat.updatedAt,
    };
  }
}
