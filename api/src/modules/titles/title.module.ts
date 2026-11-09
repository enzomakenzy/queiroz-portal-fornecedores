import { Module } from "@nestjs/common";
import { FetchPendingTitlesController } from "./controllers/title.controller";
import { FetchPendingTitlesUseCase } from "./use-cases/fetch-pending-titles.use-case";
import { TitlesRepository } from "./repositories/title.repository";
import { PrismaTitlesRepository } from "./repositories/prisma-title.repository";

@Module({
  controllers: [FetchPendingTitlesController],
  providers: [
    FetchPendingTitlesUseCase,
    { provide: TitlesRepository, useClass: PrismaTitlesRepository },
  ],
})
export class TitlesModule {}
