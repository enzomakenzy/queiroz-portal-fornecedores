import type { TitleStatusFilter } from "@/types/titles";

interface StatusFilterTabsProps {
  selectedStatus: TitleStatusFilter;
  onSelectStatus: (status: TitleStatusFilter) => void;
  totalCount: number;
  overdueCount: number;
  upcomingCount: number;
  isLoading?: boolean;
}

export function StatusFilterTabs({
  selectedStatus,
  onSelectStatus,
  totalCount,
  overdueCount,
  upcomingCount,
  isLoading = false,
}: StatusFilterTabsProps) {
  const tabs: Array<{
    id: TitleStatusFilter;
    label: string;
    count: number;
    badgeStyleActive: string;
    badgeStyleInactive: string;
  }> = [
    {
      id: "ALL",
      label: "Todos",
      count: totalCount,
      badgeStyleActive: "bg-muted text-foreground",
      badgeStyleInactive: "bg-surface/80 text-muted-foreground",
    },
    {
      id: "OVERDUE",
      label: "Vencidos",
      count: overdueCount,
      badgeStyleActive: "bg-danger-soft text-danger-strong",
      badgeStyleInactive: "bg-danger-soft/60 text-danger-strong",
    },
    {
      id: "UPCOMING",
      label: "A vencer",
      count: upcomingCount,
      badgeStyleActive: "bg-success-soft text-success-strong",
      badgeStyleInactive: "bg-success-soft/60 text-success-strong",
    },
  ];

  return (
    <div
      role="group"
      aria-label="Filtrar títulos por status"
      className="inline-flex w-full items-center gap-1 rounded-xl border border-border bg-muted/60 p-1 sm:w-auto"
    >
      {tabs.map((tab) => {
        const isActive = selectedStatus === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectStatus(tab.id)}
            disabled={isLoading}
            aria-pressed={isActive}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:flex-initial sm:text-sm ${
              isActive
                ? "bg-surface text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isActive ? tab.badgeStyleActive : tab.badgeStyleInactive
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
