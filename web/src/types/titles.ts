export type TitleStatus = "OVERDUE" | "UPCOMING";

export type TitleStatusFilter = "ALL" | TitleStatus;

export interface PendingTitleItem {
  id: number;
  speciesCode: string;
  speciesDescription: string;
  issueDate: string;
  dueDate: string;
  nominalValue: number;
  paidValue: number;
  openAmount: number;
  status: TitleStatus;
}

export interface TitlesSummary {
  totalOpenAmount: number;
  totalOverdueAmount: number;
  totalUpcomingAmount: number;
  totalCount: number;
  overdueCount: number;
  upcomingCount: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface FetchPendingTitlesResponse {
  summary: TitlesSummary;
  pagination: PaginationMeta;
  titles: PendingTitleItem[];
}
