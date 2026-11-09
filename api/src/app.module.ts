import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { envSchema } from "./infra/env/env";
import { EnvModule } from "./infra/env/env.module";
import { DatabaseModule } from "./infra/database/database.module";
import { AuthModule } from "./infra/auth/auth.module";
import { CryptographyModule } from "./infra/cryptography/cryptography.module";
import { SupplierModule } from "./modules/supplier/supplier.module";
import { TitlesModule } from "./modules/titles/title.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    DatabaseModule,
    EnvModule,
    AuthModule,
    CryptographyModule,
    SupplierModule,
    TitlesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
