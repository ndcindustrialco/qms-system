"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateKpiMaster, useUpdateKpiMaster } from "@/hooks/api/use-kpi-masters";
import { createKpiMasterSchema } from "@/schemas/kpiMasterSchema";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { KpiMaster } from "@/generated/prisma/client";

type KpiPeriodType = "YEARLY" | "QUARTERLY";

type FormValues = z.infer<typeof createKpiMasterSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpi?: KpiMaster | null;
  departments: { id: string; name: string }[];
}

export function KpiMasterFormDialog({ open, onOpenChange, kpi, departments }: Props) {
  const t = useT();
  const createMutation = useCreateKpiMaster();
  const updateMutation = useUpdateKpiMaster();

  const form = useForm<FormValues>({
    resolver: zodResolver(createKpiMasterSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      periodType: "YEARLY",
      objectiveDetails: "",
      measurementFrequency: "Every Month",
      calculationFormula: "",
      guidelines: "",
      trackingRecords: "",
      targetValue: 0,
      departmentId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (kpi) {
        form.reset({
          year: kpi.year,
          periodType: kpi.periodType as KpiPeriodType,
          objectiveDetails: kpi.objectiveDetails,
          measurementFrequency: kpi.measurementFrequency,
          calculationFormula: kpi.calculationFormula ?? "",
          guidelines: kpi.guidelines ?? "",
          trackingRecords: kpi.trackingRecords ?? "",
          targetValue: Number(kpi.targetValue),
          departmentId: kpi.departmentId,
        });
      } else {
        form.reset({
          year: new Date().getFullYear(),
          periodType: "YEARLY",
          objectiveDetails: "",
          measurementFrequency: "Every Month",
          calculationFormula: "",
          guidelines: "",
          trackingRecords: "",
          targetValue: 0,
          departmentId: "",
        });
      }
    }
  }, [open, kpi, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (kpi) {
        await updateMutation.mutateAsync({ id: kpi.id, data: values });
        toast.success(t("kpi.messages.updateSuccess"));
      } else {
        await createMutation.mutateAsync(values);
        toast.success(t("kpi.messages.createSuccess"));
      }
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "";
      toast.error(errorMessage || t("error.title"), { duration: Infinity });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#0F1059]">
            {kpi ? t("kpi.action.edit") : t("kpi.reference.add")}
          </DialogTitle>
          <DialogDescription className="sr-only">{kpi ? "Edit KPI Form" : "Add KPI Form"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("kpi.form.sectionBasic") || "Basic Information"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="year" className="text-sm font-medium text-slate-700">
                  {t("kpi.form.year")} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  className="bg-slate-50/50 border-slate-200"
                  {...form.register("year", { valueAsNumber: true })}
                />
                {form.formState.errors.year && (
                  <p className="text-xs text-rose-500">{form.formState.errors.year.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="periodType" className="text-sm font-medium text-slate-700">
                  {t("kpi.form.periodType")} <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={form.watch("periodType")}
                  onValueChange={(v) => form.setValue("periodType", v as KpiPeriodType)}
                >
                  <SelectTrigger className="bg-slate-50/50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YEARLY">{t("kpi.periodType.YEARLY")}</SelectItem>
                    <SelectItem value="QUARTERLY">{t("kpi.periodType.QUARTERLY")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="departmentId" className="text-sm font-medium text-slate-700">
                {t("kpi.form.departmentId")} <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.watch("departmentId")}
                onValueChange={(v) => form.setValue("departmentId", v)}
              >
                <SelectTrigger className="bg-slate-50/50 border-slate-200">
                  <SelectValue placeholder={t("kpi.reference.form.departmentPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.departmentId && (
                <p className="text-xs text-rose-500">{form.formState.errors.departmentId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="objectiveDetails" className="text-sm font-medium text-slate-700">
                {t("kpi.form.objectiveDetails")} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="objectiveDetails"
                className="bg-slate-50/50 border-slate-200"
                {...form.register("objectiveDetails")}
              />
              {form.formState.errors.objectiveDetails && (
                <p className="text-xs text-rose-500">{form.formState.errors.objectiveDetails.message}</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section: Target & Measurement */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("kpi.form.sectionTarget") || "Target & Measurement"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="targetValue" className="text-sm font-medium text-slate-700">
                  {t("kpi.form.targetValue")} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="targetValue"
                  type="number"
                  step="0.01"
                  className="bg-slate-50/50 border-slate-200"
                  {...form.register("targetValue", { valueAsNumber: true })}
                />
                {form.formState.errors.targetValue && (
                  <p className="text-xs text-rose-500">{form.formState.errors.targetValue.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="measurementFrequency" className="text-sm font-medium text-slate-700">
                  {t("kpi.form.measurementFrequency")}
                </Label>
                <Input
                  id="measurementFrequency"
                  className="bg-slate-50/50 border-slate-200"
                  {...form.register("measurementFrequency")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="calculationFormula" className="text-sm font-medium text-slate-700">
                {t("kpi.form.calculationFormula")}
              </Label>
              <Input
                id="calculationFormula"
                className="bg-slate-50/50 border-slate-200"
                {...form.register("calculationFormula")}
              />
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Section: Additional Notes */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("kpi.form.sectionNotes") || "Additional Notes"}
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="guidelines" className="text-sm font-medium text-slate-700">
                {t("kpi.form.guidelines")}
              </Label>
              <Textarea
                id="guidelines"
                rows={3}
                className="bg-slate-50/50 border-slate-200 resize-none"
                {...form.register("guidelines")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trackingRecords" className="text-sm font-medium text-slate-700">
                {t("kpi.form.trackingRecords")}
              </Label>
              <Textarea
                id="trackingRecords"
                rows={3}
                className="bg-slate-50/50 border-slate-200 resize-none"
                {...form.register("trackingRecords")}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              className="border-slate-200"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-[#0F1059] hover:bg-[#161875] min-w-[90px]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("save")}...
                </>
              ) : (
                t("save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
