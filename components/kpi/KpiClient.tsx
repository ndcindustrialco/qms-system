"use client";

import { useState } from "react";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useT } from "@/lib/i18n";
import PageHeader from "@/components/common/PageHeader";
import FilterBar from "@/components/common/FilterBar";
import { KpiMasterTable } from "@/components/kpi/KpiMasterTable";
import { KpiMasterFormDialog } from "@/components/kpi/KpiMasterFormDialog";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useKpiMasters, useDeleteKpiMaster } from "@/hooks/api/use-kpi-masters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { KpiMaster } from "@/generated/prisma/client";
import { toast } from "sonner";

interface Props {
  departments: { id: string; name: string }[];
  canEdit: boolean;
}

export default function KpiClient({ departments, canEdit }: Props) {
  const t = useT();
  const [formOpen, setFormOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiMaster | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [kpiToDelete, setKpiToDelete] = useState<string | null>(null);

  const { params, rawValues, setParam, clearAll, hasFilters } = useUrlFilters({
    keys: ["search", "departmentId", "year", "page"],
    searchKey: "search",
  });

  const { data, isLoading } = useKpiMasters({
    page: Number(params.page) || 1,
    limit: 20,
    search: params.search,
    departmentId: params.departmentId,
    year: params.year ? Number(params.year) : undefined,
  });

  const deleteMutation = useDeleteKpiMaster();

  const handleEdit = (kpi: KpiMaster) => {
    setEditingKpi(kpi);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setKpiToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }).map((_, i) => ({
    label: String(currentYear - i),
    value: String(currentYear - i),
  }));

  const departmentOptions = departments.map(d => ({
    label: d.name,
    value: d.id,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("kpi.reference.title")}
        actions={
          canEdit && (
            <Button onClick={() => { setEditingKpi(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              {t("kpi.reference.add")}
            </Button>
          )
        }
      />

      <FilterBar
        searchValue={rawValues.search}
        onSearchChange={(v) => setParam("search", v)}
        searchPlaceholder={t("kpi.reference.searchPlaceholder")}
        filters={[
          { key: "year", label: t("kpi.reference.table.year"), options: yearOptions },
          { key: "departmentId", label: t("kpi.reference.table.department"), options: departmentOptions },
        ]}
        filterValues={params}
        onFilterChange={setParam}
        hasActiveFilters={hasFilters}
        onClearAll={clearAll}
        resultCount={data?.data.length ?? 0}
        totalCount={data?.meta.total ?? 0}
      />

      <KpiMasterTable
        data={data?.data ?? []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        canEdit={canEdit}
        meta={data?.meta}
        onPageChange={(page) => setParam("page", String(page))}
      />

      <KpiMasterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        kpi={editingKpi}
        departments={departments}
      />

      {deleteConfirmOpen && kpiToDelete && (
        <ConfirmModal
          title={t("kpi.reference.confirmDeleteTitle")}
          message={t("kpi.reference.confirmDeleteMessage")}
          confirmLabel={t("common.delete")}
          cancelLabel={t("common.cancel")}
          onConfirm={async () => {
            try {
              await deleteMutation.mutateAsync(kpiToDelete);
              toast.success(t("kpi.messages.deleteSuccess"));
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : "";
              toast.error(errorMessage || t("error.title"), { duration: Infinity });
            } finally {
              setDeleteConfirmOpen(false);
              setKpiToDelete(null);
            }
          }}
          onCancel={() => {
            setDeleteConfirmOpen(false);
            setKpiToDelete(null);
          }}
          loading={deleteMutation.isPending}
          danger={true}
        />
      )}
    </div>
  );
}
