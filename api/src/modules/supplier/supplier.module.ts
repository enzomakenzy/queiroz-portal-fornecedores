import { Module } from "@nestjs/common";
import { AuthenticateController } from "./controllers/authenticate.controller";
import { AuthenticateUseCase } from "./use-cases/authenticate.use-case";
import { SupplierRepository } from "./repositories/supplier.repository";
import { PrismaSupplierRepository } from "./repositories/prisma-supplier.repository";

@Module({
  imports: [],
  controllers: [AuthenticateController],
  providers: [
    AuthenticateUseCase,

    { provide: SupplierRepository, useClass: PrismaSupplierRepository },
  ],
  exports: [SupplierRepository],
})
export class SupplierModule {}
