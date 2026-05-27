import { requireRole } from "@/lib/auth";
import { AnnouncementService } from "@/services/announcementService";
import AnnouncementsTableClient from "@/components/announcements/AnnouncementsTableClient";

const announceService = new AnnouncementService();

export default async function ManageAnnouncementsPage() {
  await requireRole("QMS", "IT", "MR");
  const rows = await announceService.listAnnouncements();
  return (
    <div className="max-w-350 mx-auto px-4 md:px-8">
      <AnnouncementsTableClient rows={rows} />
    </div>
  );
}
