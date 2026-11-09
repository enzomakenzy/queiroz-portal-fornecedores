import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
  UsePipes,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthenticateUseCase } from "../use-cases/authenticate.use-case";
import { WrongCredentialsError } from "../use-cases/errors/wrong-credentials.error";
import z from "zod";
import { ZodValidationPipe } from "@/infra/pipes/zod-validation.pipe";

const authenticateBodySchema = z.object({
  id: z.coerce
    .number({ message: "Supplier code (id) is required" })
    .int()
    .positive(),
  password: z.string({ message: "Password is required" }).min(1),
});
type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller("auth")
export class AuthenticateController {
  constructor(private authenticateUseCase: AuthenticateUseCase) {}

  @Post("/login")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async login(
    @Body() body: AuthenticateBodySchema,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const { accessToken, supplier } = await this.authenticateUseCase.execute({
        id: body.id,
        password: body.password,
      });

      response.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
        path: "/",
      });

      return { supplier };
    } catch (error) {
      if (error instanceof WrongCredentialsError) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("accessToken", { path: "/" });
    return { message: "Logged out successfully" };
  }
}
