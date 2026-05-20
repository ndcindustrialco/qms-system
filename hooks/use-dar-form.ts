"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { DarObjective, DarDocType, DarDetail, TempAttachmentInput } from "@/types/dar";

type ItemRow = { docNumber: string; docName: string; revision: string };

type FormState = {
  objective: DarObjective | "";
  docType: DarDocType | "";
  docTypeOther: string;
  reason: string;
  items: ItemRow[];
  distributionDepartmentIds: string[];
};

type Errors = Record<string, string>;

function validate(state: FormState): Errors {
  const errs: Errors = {};
  if (!state.objective) errs.objective = "กรุณาเลือกวัตถุประสงค์";
  if (!state.docType) errs.docType = "กรุณาเลือกประเภทเอกสาร";
  if (state.docType === "OTHER" && !state.docTypeOther.trim()) {
    errs.docTypeOther = "กรุณาระบุประเภทเอกสาร";
  }
  if (!state.reason.trim()) errs.reason = "กรุณาระบุเหตุผล";
  if (state.items.length === 0) errs.items = "ต้องมีเอกสารอย่างน้อย 1 รายการ";
  state.items.forEach((item, idx) => {
    if (!item.docNumber.trim()) errs[`items.${idx}.docNumber`] = "กรุณาระบุ";
    if (!item.docName.trim()) errs[`items.${idx}.docName`] = "กรุณาระบุ";
    if (!item.revision.trim()) errs[`items.${idx}.revision`] = "กรุณาระบุ";
  });
  return errs;
}

function buildBody(state: FormState, action: "DRAFT" | "SUBMIT") {
  return {
    objective: state.objective,
    docType: state.docType,
    docTypeOther: state.docTypeOther || undefined,
    reason: state.reason,
    items: state.items,
    distributionDepartmentIds: state.distributionDepartmentIds,
    action,
  };
}

export function useDarForm(
  mode: "create" | "edit",
  initialData: DarDetail | undefined,
  onSuccess: (message: string) => void,
  onError: (message: string) => void,
) {
  const router = useRouter();

  const [state, setState] = useState<FormState>(() => {
    if (initialData) {
      return {
        objective: initialData.objective,
        docType: initialData.docType,
        docTypeOther: initialData.docTypeOther ?? "",
        reason: initialData.reason,
        items: initialData.items.map(({ docNumber, docName, revision }) => ({ docNumber, docName, revision })),
        distributionDepartmentIds: initialData.distributions.map((d) => d.departmentId),
      };
    }
    return { objective: "", docType: "", docTypeOther: "", reason: "", items: [{ docNumber: "", docName: "", revision: "" }], distributionDepartmentIds: [] };
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // After first save (create mode), hold the darId so attachments can be uploaded
  const [savedDarId, setSavedDarId] = useState<string | null>(initialData?.id ?? null);
  // Temp attachments collected before the DAR is saved (create mode only)
  const [tempAttachments, setTempAttachments] = useState<TempAttachmentInput[]>([]);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  async function callApi(action: "DRAFT" | "SUBMIT") {
    const errs = validate(state);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const isSubmit = action === "SUBMIT";
    if (isSubmit) setIsSubmitting(true); else setIsSaving(true);

    try {
      let res: Response;

      if (mode === "create") {
        res = await fetch("/api/dar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...buildBody(state, action), tempAttachments }),
        });
      } else {
        const darId = initialData!.id;
        if (isSubmit) {
          await fetch(`/api/dar/${darId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildBody(state, "DRAFT")),
          });
          res = await fetch(`/api/dar/${darId}/submit`, { method: "POST" });
        } else {
          res = await fetch(`/api/dar/${darId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildBody(state, "DRAFT")),
          });
        }
      }

      const json = await res.json();
      if (!res.ok || json.error) {
        onError(json.error ?? "เกิดข้อผิดพลาด");
        return;
      }

      const darId = json.data.id as string;
      if (isSubmit) {
        onSuccess("ส่งคำขอสำเร็จ");
        router.push(`/dar/${darId}`);
        router.refresh();
      } else {
        setSavedDarId(darId);
        onSuccess("บันทึกฉบับร่างสำเร็จ");
        // In edit mode navigate away; in create mode stay so user can attach files
        if (mode === "edit") {
          router.push(`/dar/${darId}`);
          router.refresh();
        }
      }
    } catch {
      onError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsSaving(false);
      setIsSubmitting(false);
    }
  }

  return {
    state,
    errors,
    isSaving,
    isSubmitting,
    savedDarId,
    tempAttachments,
    setTempAttachments,
    setField,
    saveDraft: () => callApi("DRAFT"),
    submitForm: () => callApi("SUBMIT"),
  };
}
