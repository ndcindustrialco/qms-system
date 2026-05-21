export const runtime = 'nodejs';

import { desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcements, users } from "@/db/schema";
import Link from "next/link";

export default async function ManageAnnouncementsPage() {
  const session = await requireAuth();

  if (!["QMS", "IT", "MR"].includes(session.user.role)) {
    return <div className="p-8 text-error font-bold text-center">Unauthorized</div>;
  }

  const rows = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      sourceSystem: announcements.sourceSystem,
      displayType: announcements.displayType,
      startDate: announcements.startDate,
      endDate: announcements.endDate,
      fileName: announcements.fileName,
      spWebUrl: announcements.spWebUrl,
      createdByName: users.name,
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.createdById, users.id))
    .orderBy(desc(announcements.createdAt));

  return (
    <div className="max-w-350 mx-auto px-4 md:px-8 flex flex-col gap-4 animate-slide-up">
      <div className="card-premium border border-base-300 rounded-xl shadow-sm px-5 py-4 mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-primary">Manage Announcements</h1>
        <Link href="/qms/announcements/new" className="btn btn-primary btn-sm gap-2 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Announcement
        </Link>
      </div>

      <div className="card-premium overflow-hidden border border-base-300 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-base-200">
          <h2 className="text-sm md:text-base font-bold text-primary card-section-title">All Announcements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="border-b border-base-200">
                <th className="th-pro">Title</th>
                <th className="th-pro">System</th>
                <th className="th-pro">Type</th>
                <th className="th-pro">Date Range</th>
                <th className="th-pro">Attachment</th>
                <th className="th-pro">Created By</th>
                <th className="th-pro">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[11px] md:text-xs text-neutral">No announcements found.</td>
                </tr>
              ) : rows.map((a) => {
                const isActive = (!a.startDate || new Date() >= a.startDate) && (!a.endDate || new Date() <= a.endDate);
                return (
                  <tr key={a.id} className="border-b border-base-200 hover:bg-base-200 transition-colors">
                    <td className="py-3.5 px-4 text-xs md:text-sm font-semibold text-neutral max-w-50 truncate">{a.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 text-[11px] rounded-full font-bold bg-primary/10 text-primary">{a.sourceSystem}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] rounded-full font-bold ${a.displayType === 'SCROLLING' ? 'bg-info/15 text-info' : 'bg-base-200 text-neutral'}`}>
                        {a.displayType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] md:text-xs text-neutral">
                      {a.startDate ? new Date(a.startDate).toLocaleDateString() : 'Always'} — {a.endDate ? new Date(a.endDate).toLocaleDateString() : 'No End'}
                    </td>
                    <td className="py-3.5 px-4">
                      {a.fileName ? (
                        <a href={a.spWebUrl!} target="_blank" rel="noreferrer" className="text-secondary hover:underline flex items-center gap-1 text-[11px] md:text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          {a.fileName.substring(0, 15)}...
                        </a>
                      ) : (
                        <span className="text-neutral/50 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] md:text-xs text-neutral">{a.createdByName}</td>
                    <td className="py-3.5 px-4">
                      {isActive ? (
                        <span className="inline-block px-2.5 py-0.5 text-[11px] rounded-full font-bold bg-success/15 text-success">Active</span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 text-[11px] rounded-full font-bold bg-base-200 text-neutral">Inactive</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
