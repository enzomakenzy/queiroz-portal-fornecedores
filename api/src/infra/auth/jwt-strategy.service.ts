import { Injectable, UnauthorizedException } from "@nestjs/common";
import z from "zod";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Env } from "../env/env";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";
import { Request } from "express";

const tokenPayloadSchema = z.object({
  sub: z.number(),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<Env, true>,
    private prisma: PrismaService,
  ) {
    const secret = config.get("JWT_SECRET", { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return (request?.cookies?.["accessToken"] as string) ?? null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: secret,
      algorithms: ["HS256"],
    });
  }

  async validate(payload: UserPayload) {
    const result = tokenPayloadSchema.safeParse(payload);

    if (!result.success) {
      throw new UnauthorizedException("Token format invalid");
    }

    const userPayload = result.data;

    const user = await this.prisma.supplier.findUnique({
      where: { id: userPayload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return userPayload;
  }
}
