import { Prisma } from "@/generated/prisma/client";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { EnvService } from "../env/env.service";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(envService: EnvService) {
    const connectionString = envService.get("DATABASE_URL");
    const logLevel = envService.get("PRISMA_LOG");

    const adapter = new PrismaPg({ connectionString });

    super({
      adapter,
      log: PrismaService.getPrismaLogArray(logLevel),
    });
  }

  private static getPrismaLogArray(
    level: "query" | "error" | "warn" | "info",
  ): Prisma.LogLevel[] {
    switch (level) {
      case "info":
        return ["error", "warn", "query", "info"];
      case "query":
        return ["error", "warn", "query"];
      case "warn":
        return ["error", "warn"];
      case "error":
        return ["error"];
    }
  }

  onModuleInit() {
    return this.$connect();
  }

  onModuleDestroy() {
    return this.$disconnect();
  }
}
