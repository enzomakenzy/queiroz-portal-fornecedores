import { PrismaService } from "@/infra/database/prisma.service";
import { Supplier } from "../entities/supplier.entity";
import { SupplierRepository } from "./supplier.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return null;
    }

    return supplier;
  }
}
