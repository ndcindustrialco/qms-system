
import { requireRole } from "@/lib/auth";
import { DarService } from "@/services/darService";
import QmsDarPageHeader from "@/components/qms/QmsDarPageHeader";
import QmsDarListClient from "@/components/dar/QmsDarListClient";

const darService = new DarService();

export default async function QmsDarPage() {
  await requireRole("QMS", "MR", "IT");
  const dars = await darService.getAllDars();

  return (
    <div className="max-w-350 mx-auto px-4 md:px-8">
      <QmsDarPageHeader />
      <QmsDarListClient dars={dars} />
    </div>
  );
}

