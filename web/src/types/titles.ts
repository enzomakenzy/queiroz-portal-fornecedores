export type TitleStatus = "OVERDUE" | "UPCOMING";

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
}

export interface FetchPendingTitlesResponse {
  summary: TitlesSummary;
  titles: PendingTitleItem[];
}
