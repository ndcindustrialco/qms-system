"use client";

import { useState } from "react";
import type { DarSummary } from "@/types/dar";
import DarListHeader from "@/components/dar/DarListHeader";
import DarTable from "@/components/dar/DarTable";
import DarCardList from "@/components/dar/DarCardList";
import DarDrawer from "@/components/dar/DarDrawer";
import { useT } from "@/lib/i18n";

type RequesterInfo = {
  name: string | null;
  employeeId: string | null;
  department: string | null;
  requestDate: string;
};

type Props = {
  dars: DarSummary[];
  requesterInfo: RequesterInfo;
};

export default function DarListClient({ dars, requesterInfo }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const t = useT();

  const isEmpty = dars.length === 0;

  return (
    <>
      <DarListHeader onNewRequest={() => setDrawerOpen(true)} />

      {isEmpty ? (
        <div className="card-premium border border-base-300 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-neutral opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm md:text-base font-semibold text-primary">{t("emptyDarUser")}</p>
            <p className="text-xs md:text-sm text-neutral">{t("emptyDarUserDesc")}</p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn btn-primary btn-sm gap-1.5 mt-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("newRequest")}
          </button>
        </div>
      ) : (
        <>
          <DarTable dars={dars} />
          <DarCardList dars={dars} />
        </>
      )}

      <DarDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        requesterInfo={requesterInfo}
      />
    </>
  );
}
