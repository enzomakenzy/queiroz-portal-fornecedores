import { Injectable } from "@nestjs/common";
import { compare } from "bcryptjs";
import { HashComparer } from "./hash-comparer";

@Injectable()
export class BcryptHasher implements HashComparer {
  async compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}
