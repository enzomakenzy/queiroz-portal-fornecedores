import { PrismaService } from "@/infra/database/prisma.service";
import { Supplier } from "../entities/supplier.entity";
import { SupplierRepository } from "./supplier.repository";
import { Injectable } from "@nestjs/common";

interface RawSupplierRow {
  id: number;
  companyName: string;
  password: string;
}

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<Supplier | null> {
    const rows = await this.prisma.$queryRaw<RawSupplierRow[]>`
      SELECT
        f.seqpessoa AS "id",
        f.nomerazao AS "companyName",
        f.senha AS "password"
      FROM fornecedores f
      WHERE f.seqpessoa = ${id}
      LIMIT 1
    `;

    const supplier = rows[0];

    if (!supplier) {
      return null;
    }

    return {
      id: Number(supplier.id),
      companyName: supplier.companyName,
      password: supplier.password,
    };
  }
}
