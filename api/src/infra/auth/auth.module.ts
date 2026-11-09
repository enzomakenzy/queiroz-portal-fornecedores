import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Env } from "../env/env";
import { JwtStrategyService } from "./jwt-strategy.service";

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory(config: ConfigService<Env, true>) {
        const secret = config.get("JWT_SECRET", { infer: true });

        return {
          secret,
          signOptions: { algorithm: "HS256", expiresIn: "1d" },
        };
      },
    }),
  ],
  providers: [JwtStrategyService],
})
export class AuthModule {}
