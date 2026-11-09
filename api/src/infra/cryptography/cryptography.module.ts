import { Global, Module } from "@nestjs/common";
import { BcryptHasher } from "./bcrypt-hasher.service";
import { HashComparer } from "./hash-comparer";
import { Encrypter } from "./encrypter";
import { JwtEncrypter } from "./jwt-encrypter.service";

@Global()
@Module({
  providers: [
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: Encrypter, useClass: JwtEncrypter },
  ],
  exports: [HashComparer, Encrypter],
})
export class CryptographyModule {}
