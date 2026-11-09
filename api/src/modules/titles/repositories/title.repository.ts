import { Title } from "../entities/title.entity";

export type TitleStatusFilter = "ALL" | "OVERDUE" | "UPCOMING";

export interface FindPendingTitlesParams {
  page: number;
  limit: number;
  status?: TitleStatusFilter;
  referenceDate?: Date;
}

export interface PendingTitlesSummary {
  totalOpenAmount: number;
  totalOverdueAmount: number;
  totalUpcomingAmount: number;
  totalCount: number;
  overdueCount: number;
  upcomingCount: number;
}

export abstract class TitlesRepository {
  abstract findPendingBySupplierId(
    supplierId: number,
    params?: FindPendingTitlesParams,
  ): Promise<Title[]>;

  abstract getPendingSummaryBySupplierId(
    supplierId: number,
    referenceDate: Date,
  ): Promise<PendingTitlesSummary>;
}
