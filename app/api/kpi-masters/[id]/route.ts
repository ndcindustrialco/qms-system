import { NextRequest } from 'next/server';
import { KpiMasterService } from '@/services/kpiMasterService';
import { updateKpiMasterSchema } from '@/schemas/kpiMasterSchema';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/lib/auth';

const kpiMasterService = new KpiMasterService();
const idSchema = z.string().uuid('Invalid KPI Master ID format');

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth();
    const { id: rawId } = await params;
    const id = idSchema.parse(rawId);
    const kpiMaster = await kpiMasterService.getKpiMasterById(id);
    return sendSuccess(kpiMaster, 'KPI Master retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('QMS', 'IT', 'MR');
    const { id: rawId } = await params;
    const id = idSchema.parse(rawId);
    const body = await request.json();
    
    // Validate inputs
    const validatedData = updateKpiMasterSchema.parse(body);

    // Call service layer
    const updatedKpiMaster = await kpiMasterService.updateKpiMaster(id, validatedData);

    // Send uniform success response
    return sendSuccess(updatedKpiMaster, 'KPI Master updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('QMS', 'IT', 'MR');
    const { id: rawId } = await params;
    const id = idSchema.parse(rawId);
    
    // Call service layer
    await kpiMasterService.deleteKpiMaster(id);

    // Send uniform success response
    return sendSuccess(null, 'KPI Master deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
