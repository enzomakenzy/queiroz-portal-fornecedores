import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infra/database/prisma.service";
import { TitlesRepository } from "./title.repository";
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

@Injectable()
export class PrismaTitlesRepository implements TitlesRepository {
  constructor(private prisma: PrismaService) {}

  async findPendingBySupplierId(supplierId: number): Promise<Title[]> {
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
      ORDER BY t.dtavencimento ASC
    `;

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
