import { KpiMasterRepository } from '@/repositories/kpiMasterRepository';
import { NotFoundError } from '@/errors/customErrors';
import { CreateKpiMasterDTO, UpdateKpiMasterDTO } from '@/types/kpiMaster';

export class KpiMasterService {
  private kpiMasterRepo = new KpiMasterRepository();

  async listKpiMasters(page: number, limit: number, year?: number, departmentId?: string, search?: string) {
    const where: any = {};

    if (year) {
      where.year = year;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (search) {
      where.objectiveDetails = { contains: search, mode: 'insensitive' };
    }

    return this.kpiMasterRepo.paginate({ page, limit }, where);
  }

  async getKpiMasterById(id: string) {
    const kpiMaster = await this.kpiMasterRepo.findById(id);
    if (!kpiMaster) {
      throw new NotFoundError(`KPI Master with ID ${id} not found`);
    }
    return kpiMaster;
  }

  async createKpiMaster(data: CreateKpiMasterDTO) {
    return this.kpiMasterRepo.create(data);
  }

  async updateKpiMaster(id: string, data: UpdateKpiMasterDTO) {
    const existing = await this.kpiMasterRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`KPI Master with ID ${id} not found`);
    }

    return this.kpiMasterRepo.update(id, data);
  }

  async deleteKpiMaster(id: string) {
    const existing = await this.kpiMasterRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`KPI Master with ID ${id} not found`);
    }

    return this.kpiMasterRepo.delete(id);
  }
}
