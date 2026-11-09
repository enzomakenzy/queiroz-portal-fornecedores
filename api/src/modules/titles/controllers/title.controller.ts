import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { CurrentUser } from "@/infra/auth/current-user.decorator";
import type { UserPayload } from "@/infra/auth/jwt-strategy.service";
import { FetchPendingTitlesUseCase } from "../use-cases/fetch-pending-titles.use-case";
import z from "zod";
import { ZodValidationPipe } from "@/infra/pipes/zod-validation.pipe";

const queryTitlesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["ALL", "OVERDUE", "UPCOMING"]).default("ALL"),
});
type QueryTitlesSchema = z.infer<typeof queryTitlesSchema>;

@Controller("titles")
@UseGuards(JwtAuthGuard)
export class FetchPendingTitlesController {
  constructor(private fetchPendingTitlesUseCase: FetchPendingTitlesUseCase) {}

  @Get()
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(queryTitlesSchema)) query: QueryTitlesSchema,
  ) {
    const titles = await this.fetchPendingTitlesUseCase.execute({
      supplierId: user.sub,
      page: query.page,
      limit: query.limit,
      status: query.status,
    });

    return titles;
  }
}
