import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '@/errors/customErrors';
import { KpiApprovalStatus, KpiWorkflowAction } from '@/generated/prisma/client';
import { deleteItem, uploadFile } from '@/lib/sharepoint';
import { ALLOWED_MIME, hasValidMagicBytes, MAX_FILE_SIZE } from '@/lib/fileValidation';
import { KpiAuditLogRepository } from '@/repositories/kpiAuditLogRepository';
import { KpiMonthlyAttachmentRepository } from '@/repositories/kpiMonthlyAttachmentRepository';
import { KpiMonthlyRepository } from '@/repositories/kpiMonthlyRepository';
import { ActorContext } from '@/types/kpiWorkflow';

export class KpiAttachmentService {
  private monthlyRepo = new KpiMonthlyRepository();
  private attachmentRepo = new KpiMonthlyAttachmentRepository();
  private auditRepo = new KpiAuditLogRepository();

  async upload(recordId: string, file: File, actor: ActorContext, folderPath = 'KPI') {
    const record = await this.monthlyRepo.findByIdWithRelations(recordId);
    if (!record) throw new NotFoundError(`KPI monthly record ${recordId} not found`);

    if (record.approvalStatus !== KpiApprovalStatus.DRAFT && record.approvalStatus !== KpiApprovalStatus.REJECTED) {
      throw new ConflictError('Attachment upload is allowed only in draft/rejected state');
    }

    if (actor.role === 'USER' && actor.departmentId !== record.kpiMaster.departmentId) {
      throw new ForbiddenError('Cannot upload attachment for another department');
    }

    if (!ALLOWED_MIME.has(file.type)) {
      throw new ValidationError(`Unsupported file type: ${file.type}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File exceeds max size ${MAX_FILE_SIZE} bytes`);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidMagicBytes(bytes, file.type)) {
      throw new ValidationError('Invalid file signature for declared mime type');
    }

    const sp = await uploadFile(file.name, bytes, folderPath);

    const created = await this.attachmentRepo.create({
      kpiMonthlyResult: { connect: { id: recordId } },
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      spDriveId: process.env.SHAREPOINT_DRIVE_ID ?? '',
      spItemId: sp.id,
      spWebUrl: sp.webUrl,
      uploadedBy: { connect: { id: actor.userId } },
    });

    await this.auditRepo.logEvent({
      kpiMonthlyResultId: recordId,
      actorUserId: actor.userId,
      action: KpiWorkflowAction.ATTACH,
      afterJson: {
        attachmentId: created.id,
        spItemId: created.spItemId,
        fileName: created.fileName,
      },
    });

    return created;
  }

  async remove(recordId: string, attachmentId: string, actor: ActorContext) {
    const record = await this.monthlyRepo.findByIdWithRelations(recordId);
    if (!record) throw new NotFoundError(`KPI monthly record ${recordId} not found`);

    if (record.approvalStatus !== KpiApprovalStatus.DRAFT && record.approvalStatus !== KpiApprovalStatus.REJECTED) {
      throw new ConflictError('Attachment delete is allowed only in draft/rejected state');
    }

    if (actor.role === 'USER' && actor.departmentId !== record.kpiMaster.departmentId) {
      throw new ForbiddenError('Cannot delete attachment for another department');
    }

    const attachment = await this.attachmentRepo.findByIdAndRecordId(attachmentId, recordId);
    if (!attachment) throw new NotFoundError(`Attachment ${attachmentId} not found`);

    await deleteItem(attachment.spItemId);
    await this.attachmentRepo.delete(attachment.id);

    await this.auditRepo.logEvent({
      kpiMonthlyResultId: recordId,
      actorUserId: actor.userId,
      action: KpiWorkflowAction.DETACH,
      beforeJson: {
        attachmentId: attachment.id,
        spItemId: attachment.spItemId,
        fileName: attachment.fileName,
      },
    });
  }
}
