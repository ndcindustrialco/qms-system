"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useT } from "@/lib/i18n";
import PageHeader from "@/components/common/PageHeader";
import { useKpiList, useCreateKpi } from "@/hooks/api/use-kpi";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Info,
  LayoutList,
  User,
  UserCheck,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { KpiWithUsers } from "@/hooks/api/use-kpi";

interface Department { id: string; name: string }

type KpiWithObjectives = KpiWithUsers & { objectives?: unknown[] };

type UserRole = "USER" | "IT" | "QMS" | "MR";
const PRIVILEGED_ROLES: UserRole[] = ["IT", "QMS", "MR"];
function isPrivileged(role: UserRole): boolean {
  return PRIVILEGED_ROLES.includes(role);
}

interface Props {
  role: UserRole;
  userId: string;
  userDepartmentId?: string | null;
}

const STATUS_CONFIG = {
  DRAFT:          { label: "Draft",          icon: null,          class: "bg-slate-50 text-slate-500 border-slate-200" },
  PENDING_REVIEW: { label: "Pending Review", icon: Clock,         class: "bg-amber-50 text-amber-600 border-amber-200" },
  APPROVED:       { label: "Approved ✓",     icon: CheckCircle2,  class: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  REJECTED:       { label: "Rejected ✕",     icon: null,          class: "bg-rose-50 text-rose-600 border-rose-200" },
} as const;

function RoleBanner({ role }: { role: UserRole }) {
  const t = useT();
  if (isPrivileged(role)) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-sm text-emerald-700">
          <span className="font-semibold">{role}</span>{" — "}{t("kpi.rolePrivilegedDesc")}
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

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3.5 animate-pulse flex gap-4 items-center">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 rounded w-36" />
            <Skeleton className="h-4 rounded w-24" />
            <Skeleton className="h-4 rounded w-24" />
            <Skeleton className="h-4 rounded w-24" />
            <Skeleton className="h-5 rounded w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonCell({ name, icon: Icon }: { name: string | null | undefined; icon: React.ElementType }) {
  if (!name) return <span className="text-xs text-slate-300">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      {name}
    </span>
  );
}

export default function KpiObjectivesClient({ role, userDepartmentId }: Props) {
  const t = useT();
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const privileged = isPrivileged(role);
  const canEdit = privileged;

  const { data: deptResp, isLoading: deptLoading } = useQuery<{ data: Department[] }>({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error("Failed to load departments");
      return res.json();
    },
  });

  const { data: kpiResp, isLoading: kpiLoading } = useKpiList({ yearly: year, limit: 100 });

  const allDepts: Department[] = deptResp?.data ?? [];
  const allKpis = (kpiResp?.data ?? []) as KpiWithObjectives[];

  const createMutation = useCreateKpi();

  const visibleDepts = !privileged && userDepartmentId
    ? allDepts.filter(d => d.id === userDepartmentId || d.name === userDepartmentId)
    : allDepts;

  const kpiByDept = new Map<string, KpiWithObjectives>();
  for (const kpi of allKpis) {
    kpiByDept.set(kpi.department.toLowerCase(), kpi);
  }

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const isLoading = deptLoading || kpiLoading;

  async function handleCreateKpi(deptName: string) {
    try {
      const created = await createMutation.mutateAsync({
        yearly: year,
        department: deptName,
        prepare: "",
        reviewer: "",
        approver: "",
      });
      router.push(`/qms/kpi/${created.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error.title"), { duration: Infinity });
    }
  }

  function handleRowClick(dept: Department) {
    const kpi = kpiByDept.get(dept.name.toLowerCase());
    if (kpi) {
      router.push(`/qms/kpi/${kpi.id}`);
    } else if (canEdit) {
      handleCreateKpi(dept.name);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("kpi.reference.title")}
        subtitle={String(year)}
        actions={
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-28 rounded-xl text-sm h-9 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <RoleBanner role={role} />

      {isLoading ? (
        <TableSkeleton />
      ) : visibleDepts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-400">
            <LayoutList className="w-6 h-6" />
          </div>
          <p className="text-slate-800 font-semibold text-base mb-1">{t("common.noData")}</p>
          <p className="text-slate-400 text-sm">{t("kpi.reference.table.empty")}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table — shows all fields */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("kpi.form.department")}</TableHead>
                  <TableHead className="text-center">{t("kpi.objective.table.objective")}</TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />{t("kpi.form.prepare")}
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />{t("kpi.form.reviewer")}
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1.5">
                      <UserCog className="w-3.5 h-3.5" />{t("kpi.form.approver")}
                    </span>
                  </TableHead>
                  <TableHead className="text-center">{t("kpi.form.year")}</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleDepts.map(dept => {
                  const kpi = kpiByDept.get(dept.name.toLowerCase());
                  const status = kpi?.status as keyof typeof STATUS_CONFIG | undefined;
                  const cfg = status ? STATUS_CONFIG[status] : null;
                  const objCount = kpi?.objectives?.length ?? 0;
                  const isClickable = !!(kpi || canEdit);

                  return (
                    <TableRow
                      key={dept.id}
                      className={cn(
                        "transition-colors",
                        isClickable ? "hover:bg-slate-50 cursor-pointer" : "opacity-60 cursor-default",
                      )}
                      onClick={() => isClickable && handleRowClick(dept)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-sm font-semibold text-slate-800">{dept.name}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        {kpi ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                            <FileText className="w-3 h-3" />{objCount}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <PersonCell name={kpi?.prepare} icon={User} />
                      </TableCell>

                      <TableCell>
                        <PersonCell name={kpi?.reviewer} icon={UserCheck} />
                      </TableCell>

                      <TableCell>
                        <PersonCell name={kpi?.approver} icon={UserCog} />
                      </TableCell>

                      <TableCell className="text-center">
                        {cfg ? (
                          <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border", cfg.class)}>
                            {cfg.icon && <cfg.icon className="w-3 h-3" />}
                            {cfg.label}
                          </span>
                        ) : canEdit ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs rounded-lg border-dashed border-slate-300 text-slate-400 hover:text-primary hover:border-primary"
                            onClick={e => { e.stopPropagation(); handleCreateKpi(dept.name); }}
                            disabled={createMutation.isPending}
                          >
                            <Plus className="w-3 h-3 mr-1" />{t("kpi.reference.add")}
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {isClickable && <ChevronRight className="w-4 h-4 text-slate-300 inline-block" />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards — shows all fields */}
          <div className="lg:hidden space-y-3">
            {visibleDepts.map(dept => {
              const kpi = kpiByDept.get(dept.name.toLowerCase());
              const status = kpi?.status as keyof typeof STATUS_CONFIG | undefined;
              const cfg = status ? STATUS_CONFIG[status] : null;
              const isClickable = !!(kpi || canEdit);

              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleRowClick(dept)}
                  disabled={!isClickable}
                  className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 hover:border-primary/30 transition-all group disabled:opacity-60"
                >
                  {/* Header row: dept name + status */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <p className="text-sm font-semibold text-slate-800 truncate">{dept.name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cfg ? (
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", cfg.class)}>
                          {cfg.icon && <cfg.icon className="w-3 h-3" />}
                          {cfg.label}
                        </span>
                      ) : canEdit ? (
                        <span className="text-xs text-slate-400">{t("kpi.reference.add")}</span>
                      ) : null}
                      {isClickable && (
                        <ChevronRight className="w-4 h-4 text-slate-300 transition-colors group-hover:text-primary" />
                      )}
                    </div>
                  </div>

                  {/* People fields */}
                  {kpi && (
                    <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-500 border-t border-slate-50 pt-3">
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-500 w-20 shrink-0">{t("kpi.form.prepare")}:</span>
                        <span className="text-slate-700">{kpi.prepare || "—"}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-500 w-20 shrink-0">{t("kpi.form.reviewer")}:</span>
                        <span className="text-slate-700">{kpi.reviewer || "—"}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <UserCog className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-500 w-20 shrink-0">{t("kpi.form.approver")}:</span>
                        <span className="text-slate-700">{kpi.approver || "—"}</span>
                      </span>
                      {(kpi.objectives?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-500 w-20 shrink-0">{t("kpi.objective.table.objective")}:</span>
                          <span className="text-slate-700">{kpi.objectives?.length}</span>
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Error state */}
      {!isLoading && !deptResp && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-slate-800 font-semibold text-base mb-1">{t("error.title")}</p>
          <p className="text-slate-400 text-sm">{t("common.errorRetry")}</p>
        </div>
      )}
    </div>
  );
}
