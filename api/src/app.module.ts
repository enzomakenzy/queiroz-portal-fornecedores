import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { envSchema } from "./infra/env/env";
import { EnvModule } from "./infra/env/env.module";
import { DatabaseModule } from "./infra/database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    DatabaseModule,
    EnvModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
