import { signOutAction } from "@/lib/actions/auth";

type Props = { label?: string };

export default function SignOutButton({ label = "ออกจากระบบ" }: Props) {
  return (
    <form action={signOutAction} className="w-full">
      <button
        type="submit"
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-error hover:bg-error/10 transition-colors duration-150"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        {label}
      </button>
    </form>
  );
}
