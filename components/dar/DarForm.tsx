"use client";

import { useDarForm } from "@/hooks/use-dar-form";
import { useToast } from "@/hooks/use-toast";
import Toast from "@/components/common/Toast";
import DarRequesterSection from "./DarRequesterSection";
import DarObjectiveSection from "./DarObjectiveSection";
import DarItemsSection from "./DarItemsSection";
import DarDistributionSection from "./DarDistributionSection";
import DarFormActions from "./DarFormActions";
import DarAttachmentUpload from "./DarAttachmentUpload";
import type { DarDetail, DarObjective, DarDocType, TempAttachmentInput } from "@/types/dar";
import { useT } from "@/lib/i18n";

type Props = {
  mode: "create" | "edit";
  initialData?: DarDetail;
  departments: { id: string; name: string }[];
  requesterInfo: {
    name: string | null;
    employeeId: string | null;
    department: string | null;
    requestDate: string;
  };
  tempId: string;
};

export default function DarForm({ mode, initialData, departments, requesterInfo, tempId }: Props) {
  const t = useT();
  const { toast, showToast, hideToast } = useToast();

  const {
    state, errors, isSaving, isSubmitting,
    savedDarId, setTempAttachments,
    setField, saveDraft, submitForm,
  } = useDarForm(
    mode,
    initialData,
    (msg) => showToast("success", msg),
    (msg) => showToast("error", msg),
  );

  return (
    <div className="flex flex-col gap-4">
      <DarRequesterSection
        name={requesterInfo.name}
        employeeId={requesterInfo.employeeId}
        department={requesterInfo.department}
        requestDate={requesterInfo.requestDate}
      />

      <DarObjectiveSection
        objective={state.objective}
        docType={state.docType}
        docTypeOther={state.docTypeOther}
        onObjectiveChange={(v: DarObjective) => setField("objective", v)}
        onDocTypeChange={(v: DarDocType) => setField("docType", v)}
        onDocTypeOtherChange={(v) => setField("docTypeOther", v)}
        errors={{ objective: errors.objective, docType: errors.docType, docTypeOther: errors.docTypeOther }}
      />

      {/* Reason section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
        <h2 className="text-slate-800 text-base font-semibold mb-4">
          {t("sectionReason")} <span className="text-rose-600">*</span>
        </h2>
        <textarea
          className={`w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 text-slate-700 text-sm resize-none min-h-25 focus:outline-none focus:bg-white transition-colors ${
            errors.reason
              ? "border-rose-400 focus:border-rose-500"
              : "border-slate-200 focus:border-[#0F1059]"
          }`}
          placeholder={t("phReasonForRequest")}
          value={state.reason}
          onChange={(e) => setField("reason", e.target.value)}
          maxLength={2000}
        />
        {errors.reason && <p className="text-rose-600 text-xs mt-1">{errors.reason}</p>}
      </div>

      <DarItemsSection
        items={state.items}
        onChange={(items) => setField("items", items)}
        errors={errors}
      />

      <DarDistributionSection
        departments={departments}
        selected={state.distributionDepartmentIds}
        onChange={(ids) => setField("distributionDepartmentIds", ids)}
      />

      {/* Attachment section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
        <h2 className="text-slate-800 text-base font-semibold mb-2">{t("sectionAttach")}</h2>
        <p className="text-slate-400 text-sm mb-4">{t("attachDesc")}</p>

        {mode === "edit" && savedDarId ? (
          <DarAttachmentUpload
            mode="saved"
            darId={savedDarId}
            initialAttachments={initialData?.attachments ?? []}
            canEdit
          />
        ) : (
          <DarAttachmentUpload
            mode="temp"
            tempId={tempId}
            onTempItemsChange={(items: TempAttachmentInput[]) => setTempAttachments(items)}
          />
        )}
      </div>

      <DarFormActions
        mode={mode}
        isSaving={isSaving}
        isSubmitting={isSubmitting}
        onSaveDraft={saveDraft}
        onSubmit={submitForm}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={hideToast} />}
    </div>
  );
}
