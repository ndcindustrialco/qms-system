import { requireRole } from "@/lib/auth";
import { listAnnouncements } from "@/services/announcement";
import AnnouncementsTableClient from "@/components/announcements/AnnouncementsTableClient";

export default async function ManageAnnouncementsPage() {
  await requireRole("QMS", "IT", "MR");
  const rows = await listAnnouncements();
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      <AnnouncementsTableClient rows={rows} />
    </div>
  );
}
