import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function EmptyState({ title, description, ctaLabel, ctaHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {/* Icon container */}
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

      {/* Text */}
      <div className="flex flex-col gap-1">
        <p className="text-sm md:text-base font-semibold text-primary">{title}</p>
        {description && (
          <p className="text-xs md:text-sm text-gray-500">{description}</p>
        )}
      </div>

      {/* CTA */}
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn btn-primary btn-sm mt-2">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
