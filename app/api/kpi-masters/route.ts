import { NextRequest } from 'next/server';
import { KpiMasterService } from '@/services/kpiMasterService';
import { createKpiMasterSchema, kpiMasterQuerySchema } from '@/schemas/kpiMasterSchema';
import { sendSuccess } from '@/lib/apiResponse';
import { handleApiError } from '@/lib/apiErrorHandler';
import { requireAuth, requireRole } from '@/lib/auth';

const kpiMasterService = new KpiMasterService();

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    
    // Validate inputs
    const validatedQuery = kpiMasterQuerySchema.parse(searchParams);

    const page = validatedQuery.page || 1;
    const limit = validatedQuery.limit || 20;

    const result = await kpiMasterService.listKpiMasters(
      page,
      limit,
      validatedQuery.year,
      validatedQuery.departmentId,
      validatedQuery.search
    );

    return sendSuccess(result.data, 'KPI Masters retrieved successfully', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('QMS', 'IT', 'MR');
    const body = await request.json();
    
    // Validate inputs
    const validatedData = createKpiMasterSchema.parse(body);

    // Call service layer
    const newKpiMaster = await kpiMasterService.createKpiMaster(validatedData);

    // Send uniform success response
    return sendSuccess(newKpiMaster, 'KPI Master created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
