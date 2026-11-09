import { Injectable } from "@nestjs/common";
import { TitlesRepository } from "../repositories/title.repository";

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

interface FetchPendingTitlesUseCaseRequest {
  supplierId: number;
}

export interface FetchPendingTitlesUseCaseResponse {
  summary: {
    totalOpenAmount: number;
    totalOverdueAmount: number;
    totalUpcomingAmount: number;
    totalCount: number;
  };
  titles: PendingTitleItem[];
}

@Injectable()
export class FetchPendingTitlesUseCase {
  constructor(private titlesRepository: TitlesRepository) {}

  async execute({
    supplierId,
  }: FetchPendingTitlesUseCaseRequest): Promise<FetchPendingTitlesUseCaseResponse> {
    const rawTitles =
      await this.titlesRepository.findPendingBySupplierId(supplierId);

    // Data de hoje zerada em UTC (YYYY-MM-DDT00:00:00.000Z) para comparação justa de datas
    const now = new Date();
    const todayUtc = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );

    let totalOpenAmount = 0;
    let totalOverdueAmount = 0;
    let totalUpcomingAmount = 0;

    const titles: PendingTitleItem[] = rawTitles.map((title) => {
      const openAmount = Number(
        (title.nominalValue - title.paidValue).toFixed(2),
      );

      const isOverdue = title.dueDate.getTime() < todayUtc.getTime();
      const status: TitleStatus = isOverdue ? "OVERDUE" : "UPCOMING";

      totalOpenAmount += openAmount;
      if (isOverdue) {
        totalOverdueAmount += openAmount;
      } else {
        totalUpcomingAmount += openAmount;
      }

      return {
        id: title.id,
        speciesCode: title.speciesCode,
        speciesDescription: title.speciesDescription,
        issueDate: title.issueDate,
        dueDate: title.dueDate,
        nominalValue: title.nominalValue,
        paidValue: title.paidValue,
        openAmount,
        status,
      };
    });

    return {
      summary: {
        totalOpenAmount: Number(totalOpenAmount.toFixed(2)),
        totalOverdueAmount: Number(totalOverdueAmount.toFixed(2)),
        totalUpcomingAmount: Number(totalUpcomingAmount.toFixed(2)),
        totalCount: titles.length,
      },
      titles,
    };
  }
}
