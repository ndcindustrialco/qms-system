"use client";

import Link from "next/link";
import type { UserRole } from "@/generated/prisma/client";
import { useT } from "@/lib/i18n";

type ActionDef = {
  roles: UserRole[];
  href: string;
  labelKey: string;
  subKey: string;
  color: string;
  light: string;
  icon: React.ReactNode;
};

type Props = { role: UserRole };

function PlusIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
}
function TrackIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function CheckDocIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
}
function FolderIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h3.586a1 1 0 01.707.293L10.707 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>;
}
function MegaphoneIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
}
function UserStarIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function UsersIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
function BuildingIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
}

const ALL_ACTIONS: ActionDef[] = [
  { roles: ["USER","QMS","MR","IT"], href: "/dar/new",           labelKey: "dashboard.quickActions.newDar",       subKey: "dashboard.quickActions.docRequest",   color: "#0F1059", light: "rgba(15,16,89,0.08)",    icon: <PlusIcon /> },
  { roles: ["USER","QMS","MR","IT"], href: "/dar",               labelKey: "dashboard.quickActions.trackDar",     subKey: "dashboard.quickActions.myRequests",   color: "#1D6A8A", light: "rgba(29,106,138,0.08)",  icon: <TrackIcon /> },
  { roles: ["QMS","MR","IT"],        href: "/qms/dar",           labelKey: "dashboard.quickActions.manageDar",    subKey: "dashboard.quickActions.reviewApprove",color: "#7C3AED", light: "rgba(124,58,237,0.08)",  icon: <CheckDocIcon /> },
  { roles: ["QMS","MR","IT"],        href: "/qms/sharepoint",    labelKey: "dashboard.quickActions.documents",    subKey: "dashboard.quickActions.sharepointFiles",color:"#059669", light: "rgba(5,150,105,0.08)",   icon: <FolderIcon /> },
  { roles: ["QMS","MR","IT"],        href: "/qms/announcements", labelKey: "dashboard.quickActions.announcements",subKey: "dashboard.quickActions.manageNews",   color: "#D97706", light: "rgba(217,119,6,0.08)",   icon: <MegaphoneIcon /> },
  { roles: ["QMS","IT","MR"],        href: "/qms/mr",            labelKey: "dashboard.quickActions.mr",           subKey: "dashboard.quickActions.mgmtRep",      color: "#DC2626", light: "rgba(220,38,38,0.08)",   icon: <UserStarIcon /> },
  { roles: ["IT"],                   href: "/it/users",          labelKey: "dashboard.quickActions.users",        subKey: "dashboard.quickActions.userAccounts", color: "#0369A1", light: "rgba(3,105,161,0.08)",   icon: <UsersIcon /> },
  { roles: ["IT"],                   href: "/it/departments",    labelKey: "dashboard.quickActions.departments",  subKey: "dashboard.quickActions.organization", color: "#0F766E", light: "rgba(15,118,110,0.08)",  icon: <BuildingIcon /> },
];

export default function DashboardQuickActions({ role }: Props) {
  const t = useT();
  const actions = ALL_ACTIONS.filter((a) => (a.roles as string[]).includes(role));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((a) => (
        <Link key={a.href} href={a.href}
          className="group relative flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute left-0 top-0 bottom-0 w-0.75 rounded-r-sm" style={{ background: a.color }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110"
            style={{ background: a.light, color: a.color }}>
            {a.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: a.color }}>{t(a.labelKey)}</p>
            <p className="text-xs text-slate-400 truncate">{t(a.subKey)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
