"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useKpiList } from "@/hooks/api/use-kpi";
import { useKpiMonthlyList, useCreateMonthlyReport } from "@/hooks/api/use-kpi-monthly";
import { KpiMonthlyTable } from "@/components/kpi/KpiMonthlyTable";
import KpiMonthlyDetailDrawer from "@/components/kpi/KpiMonthlyDetailDrawer";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, ShieldCheck, Info } from "lucide-react";
import { toast } from "sonner";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const STATUSES = ["DRAFT", "PENDING_REVIEW", "PENDING_APPROVAL", "APPROVED", "REJECTED"] as const;

type UserRole = "USER" | "IT" | "QMS" | "MR";

const PRIVILEGED_ROLES: UserRole[] = ["IT", "QMS", "MR"];

function isPrivileged(role: UserRole): boolean {
  return PRIVILEGED_ROLES.includes(role);
}

interface Props {
  userRole: UserRole;
}

function RoleBanner({ role }: { role: UserRole }) {
  const t = useT();
  if (isPrivileged(role)) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-sm text-emerald-700">
          <span className="font-semibold">{role}</span>
          {" — "}
          {t("kpi.rolePrivilegedDesc")}
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
      <p className="text-sm text-sky-700">{t("kpi.roleUserDesc")}</p>
    </div>
  );
}

export default function KpiMonthlyClient({ userRole }: Props) {
  const t = useT();
  const currentYear = new Date().getFullYear();
  const privileged = isPrivileged(userRole);

  const { params, setParam } = useUrlFilters({ keys: ["mKpi", "mYear", "mMonth", "mDept", "mStatus", "mPage", "mReport"] });

  const year = Number(params.mYear) || currentYear;
  const month = (params.mMonth as typeof MONTHS[number]) || undefined;
  const status = (params.mStatus as typeof STATUSES[number]) || undefined;
  const page = Number(params.mPage) || 1;

  const kpiListQuery = useKpiList({ yearly: year, department: privileged ? params.mDept : undefined });
  const kpis = (kpiListQuery.data?.data ?? []) as { id: string; department: string }[];

  const selectedKpiId = params.mKpi || kpis[0]?.id || null;

  const { data, isLoading } = useKpiMonthlyList(selectedKpiId ?? "", { page, limit: 15, year, month, status });

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newMonth, setNewMonth] = useState<typeof MONTHS[number]>("Jan");
  const [newYear, setNewYear] = useState(currentYear);

  const createMutation = useCreateMonthlyReport();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i + 1);

  useEffect(() => {
    if (!params.mReport) return;
    setSelectedReportId(params.mReport);
    setDrawerOpen(true);
  }, [params.mReport]);

  async function handleCreateReport() {
    if (!selectedKpiId) return;
    try {
      await createMutation.mutateAsync({ kpiId: selectedKpiId, month: newMonth, year: newYear });
      toast.success(t("kpi.monthly.messages.createSuccess"));
      setCreateOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error.title"), { duration: Infinity });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("kpi.monthly.title")} subtitle={t("kpi.monthly.subtitle")} />

      <RoleBanner role={userRole} />

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-5 py-4">
        <div className="flex flex-wrap gap-3 items-center">
          {kpis.length > 0 && (
            <Select value={selectedKpiId ?? ""} onValueChange={v => setParam("mKpi", v)}>
              <SelectTrigger className="w-50 rounded-xl text-sm h-9 bg-slate-50/50 border-slate-200">
                <SelectValue placeholder={t("kpi.monthly.filter.selectKpi")} />
              </SelectTrigger>
              <SelectContent>
                {kpis.map(k => <SelectItem key={k.id} value={k.id}>{k.department}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          <Select value={String(year)} onValueChange={v => setParam("mYear", v)}>
            <SelectTrigger className="w-25 rounded-xl text-sm h-9 bg-slate-50/50 border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={params.mMonth ?? "all"} onValueChange={v => setParam("mMonth", v === "all" ? "" : v)}>
            <SelectTrigger className="w-35 rounded-xl text-sm h-9 bg-slate-50/50 border-slate-200">
              <SelectValue placeholder={t("kpi.monthly.filter.allMonths")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("kpi.monthly.filter.allMonths")}</SelectItem>
              {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={params.mStatus ?? "all"} onValueChange={v => setParam("mStatus", v === "all" ? "" : v)}>
            <SelectTrigger className="w-42.5 rounded-xl text-sm h-9 bg-slate-50/50 border-slate-200">
              <SelectValue placeholder={t("kpi.monthly.filter.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("kpi.monthly.filter.allStatuses")}</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s}>{t(`kpi.monthly.status.${s}` as Parameters<typeof t>[0])}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedKpiId && (
            <Button onClick={() => setCreateOpen(true)} className="ml-auto rounded-xl bg-primary hover:bg-primary/90" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />{t("kpi.monthly.createReport")}
            </Button>
          )}
        </div>
      </div>

      <KpiMonthlyTable
        data={data?.data ?? []}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={p => setParam("mPage", String(p))}
        onRowClick={row => { setSelectedReportId(row.id); setDrawerOpen(true); }}
      />

      <KpiMonthlyDetailDrawer
        kpiId={selectedKpiId}
        reportId={drawerOpen ? selectedReportId : null}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        userRole={userRole}
      />

      {/* Create Report Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-primary">{t("kpi.monthly.createReport")}</DialogTitle>
            <DialogDescription className="sr-only">Create monthly report</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{t("kpi.monthly.table.month")}</label>
              <Select value={newMonth} onValueChange={v => setNewMonth(v as typeof MONTHS[number])}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{t("kpi.form.year")}</label>
              <Select value={String(newYear)} onValueChange={v => setNewYear(Number(v))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
            <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={handleCreateReport} disabled={createMutation.isPending}>
              {createMutation.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
