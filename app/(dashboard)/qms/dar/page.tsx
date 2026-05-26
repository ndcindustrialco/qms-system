
import { requireRole } from "@/lib/auth";
import { getAllDars } from "@/services/dar";
import QmsDarPageHeader from "@/components/qms/QmsDarPageHeader";
import QmsDarListClient from "@/components/dar/QmsDarListClient";

export default async function QmsDarPage() {
  await requireRole("QMS", "MR", "IT");
  const dars = await getAllDars();

  return (
    <div className="max-w-350 mx-auto px-4 md:px-8">
      <QmsDarPageHeader />
      <QmsDarListClient dars={dars} />
    </div>
  );
}

