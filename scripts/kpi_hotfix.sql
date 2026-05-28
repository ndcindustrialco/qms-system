DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'KpiObjectiveStatus') THEN
    CREATE TYPE "KpiObjectiveStatus" AS ENUM ('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED','ARCHIVED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'KpiSignerRole') THEN
    CREATE TYPE "KpiSignerRole" AS ENUM ('SUBMITTER','APPROVER');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'KpiWorkflowAction') THEN
    CREATE TYPE "KpiWorkflowAction" AS ENUM ('SUBMIT','APPROVE','REJECT','CLOSE','REOPEN','ATTACH','DETACH');
  END IF;
END
$$;

ALTER TABLE "KpiMaster"
  ADD COLUMN IF NOT EXISTS "objectiveStatus" "KpiObjectiveStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "approvedById" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'KpiMaster_approvedById_fkey'
  ) THEN
    ALTER TABLE "KpiMaster"
      ADD CONSTRAINT "KpiMaster_approvedById_fkey"
      FOREIGN KEY ("approvedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

ALTER TABLE "KpiMonthlyResult"
  ADD COLUMN IF NOT EXISTS "periodYear" INTEGER,
  ADD COLUMN IF NOT EXISTS "submittedById" TEXT,
  ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "approvedById" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3);

UPDATE "KpiMonthlyResult" kmr
SET "periodYear" = km."year"
FROM "KpiMaster" km
WHERE kmr."kpiMasterId" = km."id"
  AND kmr."periodYear" IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'KpiMonthlyResult_submittedById_fkey'
  ) THEN
    ALTER TABLE "KpiMonthlyResult"
      ADD CONSTRAINT "KpiMonthlyResult_submittedById_fkey"
      FOREIGN KEY ("submittedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'KpiMonthlyResult_approvedById_fkey'
  ) THEN
    ALTER TABLE "KpiMonthlyResult"
      ADD CONSTRAINT "KpiMonthlyResult_approvedById_fkey"
      FOREIGN KEY ("approvedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "KpiMonthlyAttachment" (
  "id" TEXT PRIMARY KEY,
  "kpiMonthlyResultId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "spDriveId" TEXT NOT NULL,
  "spItemId" TEXT NOT NULL,
  "spWebUrl" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KpiMonthlyAttachment_kpiMonthlyResultId_fkey" FOREIGN KEY ("kpiMonthlyResultId") REFERENCES "KpiMonthlyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "KpiMonthlyAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "KpiSignatureLog" (
  "id" TEXT PRIMARY KEY,
  "kpiMonthlyResultId" TEXT NOT NULL,
  "signerId" TEXT NOT NULL,
  "signerRole" "KpiSignerRole" NOT NULL,
  "contentHash" TEXT NOT NULL,
  "action" "KpiWorkflowAction" NOT NULL,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KpiSignatureLog_kpiMonthlyResultId_fkey" FOREIGN KEY ("kpiMonthlyResultId") REFERENCES "KpiMonthlyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "KpiSignatureLog_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "KpiAuditLog" (
  "id" TEXT PRIMARY KEY,
  "kpiMonthlyResultId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "action" "KpiWorkflowAction" NOT NULL,
  "beforeJson" JSONB,
  "afterJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KpiAuditLog_kpiMonthlyResultId_fkey" FOREIGN KEY ("kpiMonthlyResultId") REFERENCES "KpiMonthlyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "KpiAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "KpiMonthlyAttachment_kpiMonthlyResultId_idx" ON "KpiMonthlyAttachment"("kpiMonthlyResultId");
CREATE INDEX IF NOT EXISTS "KpiMonthlyAttachment_spItemId_idx" ON "KpiMonthlyAttachment"("spItemId");
CREATE INDEX IF NOT EXISTS "KpiSignatureLog_kpiMonthlyResultId_idx" ON "KpiSignatureLog"("kpiMonthlyResultId");
CREATE INDEX IF NOT EXISTS "KpiSignatureLog_signerId_idx" ON "KpiSignatureLog"("signerId");
CREATE INDEX IF NOT EXISTS "KpiAuditLog_kpiMonthlyResultId_idx" ON "KpiAuditLog"("kpiMonthlyResultId");
CREATE INDEX IF NOT EXISTS "KpiAuditLog_actorUserId_idx" ON "KpiAuditLog"("actorUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "KpiMonthlyResult_kpiMasterId_periodYear_month_key" ON "KpiMonthlyResult"("kpiMasterId","periodYear","month");

