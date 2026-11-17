import Link from "next/link";

// Shared empty state: says what is missing, why it matters, and gives one next step.
export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{body}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn btn-outline">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
