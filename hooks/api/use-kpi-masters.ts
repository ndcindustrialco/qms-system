import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateKpiMasterDTO, UpdateKpiMasterDTO, KpiMasterQueryDTO } from "@/types/kpiMaster";
import { KpiMaster } from "@/generated/prisma/client";

export function useKpiMasters(params: KpiMasterQueryDTO) {
  return useQuery({
    queryKey: ["kpiMasters", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", String(params.page));
      if (params.limit) searchParams.append("limit", String(params.limit));
      if (params.year) searchParams.append("year", String(params.year));
      if (params.departmentId) searchParams.append("departmentId", params.departmentId);
      if (params.search) searchParams.append("search", params.search);

      const res = await fetch(`/api/kpi-masters?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch KPI masters");
      return (await res.json()) as { data: (KpiMaster & { department: { name: string } })[]; meta: { page: number; limit: number; total: number } };
    },
  });
}

export function useCreateKpiMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateKpiMasterDTO) => {
      const res = await fetch("/api/kpi-masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to create KPI master");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpiMasters"] });
    },
  });
}

export function useUpdateKpiMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateKpiMasterDTO }) => {
      const res = await fetch(`/api/kpi-masters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to update KPI master");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpiMasters"] });
    },
  });
}

export function useDeleteKpiMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/kpi-masters/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to delete KPI master");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpiMasters"] });
    },
  });
}
