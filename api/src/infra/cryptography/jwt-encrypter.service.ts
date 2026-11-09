/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from "@nestjs/common";
import { Encrypter } from "./encrypter";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  async encrypt(
    payload: Record<string, unknown>,
    options?: { expiresIn: string },
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: options?.expiresIn as any,
    });
  }
}
