import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { CurrentUser } from "@/infra/auth/current-user.decorator";
import type { UserPayload } from "@/infra/auth/jwt-strategy.service";
import { FetchPendingTitlesUseCase } from "../use-cases/fetch-pending-titles.use-case";

@Controller("titles")
@UseGuards(JwtAuthGuard)
export class FetchPendingTitlesController {
  constructor(private fetchPendingTitlesUseCase: FetchPendingTitlesUseCase) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const titles = await this.fetchPendingTitlesUseCase.execute({
      supplierId: user.sub,
    });

    return titles;
  }
}
