"use client";

import { useT } from "@/lib/i18n";

type Props = {
  isSaving: boolean;
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onSubmit: () => void;
  mode: "create" | "edit";
};

export default function DarFormActions({ isSaving, isSubmitting, onSaveDraft, onSubmit, mode }: Props) {
  const t = useT();
  const isLoading = isSaving || isSubmitting;

  return (
    <div className="card-premium p-5">
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isLoading}
          className="btn btn-ghost btn-sm gap-1 order-2 sm:order-1"
        >
          {isSaving && <span className="loading loading-spinner loading-xs" />}
          {mode === "create" ? t("saveDraft") : t("saveEdits")}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="btn btn-primary btn-sm gap-1 order-1 sm:order-2"
        >
          {isSubmitting && <span className="loading loading-spinner loading-xs" />}
          {t("submitRequest")}
        </button>
      </div>
    </div>
  );
}
