"use client";

import { useState } from "react";
import type { DarDetail } from "@/types/dar";
import type { SignatureType } from "@/types/dar";
import DarApprovalPanel from "./DarApprovalPanel";
import DarStatusBadge from "./DarStatusBadge";

interface Props {
  initialDar: DarDetail;
  currentUserId: string;
  savedSignatureUrl?: string | null;
  savedSignatureType?: SignatureType | null;
}

export default function DarApprovalPanelWrapper({ initialDar, currentUserId, savedSignatureUrl, savedSignatureType }: Props) {
  const [dar, setDar] = useState<DarDetail>(initialDar);
  const [flash, setFlash] = useState<string | null>(null);

  function handleUpdated(updated: DarDetail) {
    setDar(updated);
    setFlash("ดำเนินการสำเร็จ");
    setTimeout(() => setFlash(null), 3000);
  }

  return (
    <div className="flex flex-col gap-3">
      {flash && (
        <div className="alert alert-success text-[14px] py-2 px-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{flash}</span>
          <div className="ml-auto">
            <DarStatusBadge status={dar.status} />
          </div>
        </div>
      )}
      <DarApprovalPanel
        dar={dar}
        currentUserId={currentUserId}
        savedSignatureUrl={savedSignatureUrl}
        savedSignatureType={savedSignatureType}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
