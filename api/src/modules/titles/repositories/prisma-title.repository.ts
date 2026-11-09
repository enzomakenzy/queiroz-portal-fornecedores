import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infra/database/prisma.service";
import { Prisma } from "@/generated/prisma/client";
import {
  FindPendingTitlesParams,
  PendingTitlesSummary,
  TitlesRepository,
} from "./title.repository";
import { Title } from "../entities/title.entity";

interface RawTitleRow {
  id: number;
  supplierId: number;
  speciesCode: string;
  speciesDescription: string;
  issueDate: Date;
  dueDate: Date;
  nominalValue: string | number;
  paidValue: string | number;
}

interface RawSummaryRow {
  totalOpenAmount: string | number;
  totalOverdueAmount: string | number;
  totalUpcomingAmount: string | number;
  totalCount: string | number;
  overdueCount: string | number;
  upcomingCount: string | number;
}

@Injectable()
export class PrismaTitlesRepository implements TitlesRepository {
  constructor(private prisma: PrismaService) {}

  async findPendingBySupplierId(
    supplierId: number,
    params?: FindPendingTitlesParams,
  ): Promise<Title[]> {
    let statusCondition = Prisma.empty;

    if (params?.status === "OVERDUE" && params?.referenceDate) {
      statusCondition = Prisma.sql`AND t.dtavencimento < ${params.referenceDate}`;
    } else if (params?.status === "UPCOMING" && params?.referenceDate) {
      statusCondition = Prisma.sql`AND t.dtavencimento >= ${params.referenceDate}`;
    }

    if (params) {
      const offset = (params.page - 1) * params.limit;
      const rows = await this.prisma.$queryRaw<RawTitleRow[]>`
        SELECT
          t.seqtitulo AS "id",
          t.seqpessoa AS "supplierId",
          t.codespecie AS "speciesCode",
          e.descricao AS "speciesDescription",
          t.dtaemissao AS "issueDate",
          t.dtavencimento AS "dueDate",
          t.vlrnominal AS "nominalValue",
          t.vlrpago AS "paidValue"
        FROM titulos t
        INNER JOIN especies e ON t.codespecie = e.codespecie
        WHERE t.seqpessoa = ${supplierId}
          AND e.obrigdireito = 'D'::obrigdireito_enum
          AND (t.vlrnominal - t.vlrpago) > 0
          ${statusCondition}
        ORDER BY t.dtavencimento ASC, t.seqtitulo ASC
        LIMIT ${params.limit} OFFSET ${offset}
      `;

      return this.mapRowsToEntities(rows);
    }

    const rows = await this.prisma.$queryRaw<RawTitleRow[]>`
      SELECT
        t.seqtitulo AS "id",
        t.seqpessoa AS "supplierId",
        t.codespecie AS "speciesCode",
        e.descricao AS "speciesDescription",
        t.dtaemissao AS "issueDate",
        t.dtavencimento AS "dueDate",
        t.vlrnominal AS "nominalValue",
        t.vlrpago AS "paidValue"
      FROM titulos t
      INNER JOIN especies e ON t.codespecie = e.codespecie
      WHERE t.seqpessoa = ${supplierId}
        AND e.obrigdireito = 'D'::obrigdireito_enum
        AND (t.vlrnominal - t.vlrpago) > 0
        ${statusCondition}
      ORDER BY t.dtavencimento ASC, t.seqtitulo ASC
    `;

    return this.mapRowsToEntities(rows);
  }

  async getPendingSummaryBySupplierId(
    supplierId: number,
    referenceDate: Date,
  ): Promise<PendingTitlesSummary> {
    const rows = await this.prisma.$queryRaw<RawSummaryRow[]>`
      SELECT
        COALESCE(SUM(t.vlrnominal - t.vlrpago), 0) AS "totalOpenAmount",
        COALESCE(SUM(CASE WHEN t.dtavencimento < ${referenceDate} THEN (t.vlrnominal - t.vlrpago) ELSE 0 END), 0) AS "totalOverdueAmount",
        COALESCE(SUM(CASE WHEN t.dtavencimento >= ${referenceDate} THEN (t.vlrnominal - t.vlrpago) ELSE 0 END), 0) AS "totalUpcomingAmount",
        COUNT(*)::int AS "totalCount",
        COALESCE(SUM(CASE WHEN t.dtavencimento < ${referenceDate} THEN 1 ELSE 0 END), 0)::int AS "overdueCount",
        COALESCE(SUM(CASE WHEN t.dtavencimento >= ${referenceDate} THEN 1 ELSE 0 END), 0)::int AS "upcomingCount"
      FROM titulos t
      INNER JOIN especies e ON t.codespecie = e.codespecie
      WHERE t.seqpessoa = ${supplierId}
        AND e.obrigdireito = 'D'::obrigdireito_enum
        AND (t.vlrnominal - t.vlrpago) > 0
    `;

    const summary = rows[0];

    return {
      totalOpenAmount: Number(Number(summary?.totalOpenAmount ?? 0).toFixed(2)),
      totalOverdueAmount: Number(
        Number(summary?.totalOverdueAmount ?? 0).toFixed(2),
      ),
      totalUpcomingAmount: Number(
        Number(summary?.totalUpcomingAmount ?? 0).toFixed(2),
      ),
      totalCount: Number(summary?.totalCount ?? 0),
      overdueCount: Number(summary?.overdueCount ?? 0),
      upcomingCount: Number(summary?.upcomingCount ?? 0),
    };
  }

  private mapRowsToEntities(rows: RawTitleRow[]): Title[] {
    return rows.map((row) => ({
      id: Number(row.id),
      supplierId: Number(row.supplierId),
      speciesCode: row.speciesCode,
      speciesDescription: row.speciesDescription,
      issueDate: new Date(row.issueDate),
      dueDate: new Date(row.dueDate),
      nominalValue: Number(row.nominalValue),
      paidValue: Number(row.paidValue),
    }));
  }
}
