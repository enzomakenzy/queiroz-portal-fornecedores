import type { TitleStatus } from "@/types/titles";

interface TitleStatusBadgeProps {
  status: TitleStatus;
}

export function TitleStatusBadge({ status }: TitleStatusBadgeProps) {
  const isOverdue = status === "OVERDUE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
        isOverdue
          ? "bg-danger-soft text-danger-strong"
          : "bg-success-soft text-success-strong"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isOverdue ? "bg-danger-strong" : "bg-success-strong"
        }`}
        aria-hidden="true"
      />
      {isOverdue ? "Vencido" : "A vencer"}
    </span>
  );
}
