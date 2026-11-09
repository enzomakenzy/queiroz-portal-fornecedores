import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { EnvService } from "./infra/env/env.service";
import cookieParser from "cookie-parser";
import { GlobalExceptionFilter } from "./infra/https/global-filter-exception";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const envService = app.get(EnvService);

  const port = envService.get("PORT");
  await app.listen(port);
}
void bootstrap();
