import { KpiSignatureLog, Prisma } from '@/generated/prisma/client';
import { BaseRepository } from '@/repositories/baseRepository';
import { CreateSignatureLogDTO } from '@/types/kpiWorkflow';

export class KpiSignatureRepository extends BaseRepository<KpiSignatureLog, Prisma.KpiSignatureLogCreateInput, Prisma.KpiSignatureLogUpdateInput> {
  constructor() {
    super('kpiSignatureLog');
  }

  async addSignature(payload: CreateSignatureLogDTO, tx?: Prisma.TransactionClient) {
    return this.getModel(tx).create({
      data: {
        kpiMonthlyResult: { connect: { id: payload.kpiMonthlyResultId } },
        signer: { connect: { id: payload.signerId } },
        signerRole: payload.signerRole,
        contentHash: payload.contentHash,
        action: payload.action,
      },
    });
  }
}
