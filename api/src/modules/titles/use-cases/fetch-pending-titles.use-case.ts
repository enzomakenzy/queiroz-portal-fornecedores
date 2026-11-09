import { Injectable } from "@nestjs/common";
import {
  PendingTitlesSummary,
  TitleStatusFilter,
  TitlesRepository,
} from "../repositories/title.repository";

export type TitleStatus = "OVERDUE" | "UPCOMING";

export interface PendingTitleItem {
  id: number;
  speciesCode: string;
  speciesDescription: string;
  issueDate: Date;
  dueDate: Date;
  nominalValue: number;
  paidValue: number;
  openAmount: number;
  status: TitleStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface FetchPendingTitlesUseCaseRequest {
  supplierId: number;
  page?: number;
  limit?: number;
  status?: TitleStatusFilter;
}

export interface FetchPendingTitlesUseCaseResponse {
  summary: PendingTitlesSummary;
  pagination: PaginationMeta;
  titles: PendingTitleItem[];
}

@Injectable()
export class FetchPendingTitlesUseCase {
  constructor(private titlesRepository: TitlesRepository) {}

  async execute({
    supplierId,
    page = 1,
    limit = 10,
    status = "ALL",
  }: FetchPendingTitlesUseCaseRequest): Promise<FetchPendingTitlesUseCaseResponse> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));

    // Data de hoje zerada em UTC (YYYY-MM-DDT00:00:00.000Z) para comparação justa de datas
    const now = new Date();
    const todayUtc = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );

    const [summary, rawTitles] = await Promise.all([
      this.titlesRepository.getPendingSummaryBySupplierId(
        supplierId,
        todayUtc,
      ),
      this.titlesRepository.findPendingBySupplierId(supplierId, {
        page: safePage,
        limit: safeLimit,
        status,
        referenceDate: todayUtc,
      }),
    ]);

    const filteredTotalCount =
      status === "OVERDUE"
        ? summary.overdueCount
        : status === "UPCOMING"
          ? summary.upcomingCount
          : summary.totalCount;

    const totalPages = Math.max(
      1,
      Math.ceil(filteredTotalCount / safeLimit),
    );

    const titles: PendingTitleItem[] = rawTitles.map((title) => {
      const openAmount = Number(
        (title.nominalValue - title.paidValue).toFixed(2),
      );

      const isOverdue = title.dueDate.getTime() < todayUtc.getTime();
      const itemStatus: TitleStatus = isOverdue ? "OVERDUE" : "UPCOMING";

      return {
        id: title.id,
        speciesCode: title.speciesCode,
        speciesDescription: title.speciesDescription,
        issueDate: title.issueDate,
        dueDate: title.dueDate,
        nominalValue: title.nominalValue,
        paidValue: title.paidValue,
        openAmount,
        status: itemStatus,
      };
    });

    return {
      summary,
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalCount: filteredTotalCount,
        totalPages,
      },
      titles,
    };
  }
}
