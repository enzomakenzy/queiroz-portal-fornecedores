import { Encrypter } from "@/infra/cryptography/encrypter";
import { HashComparer } from "@/infra/cryptography/hash-comparer";
import { Injectable } from "@nestjs/common";
import { WrongCredentialsError } from "./errors/wrong-credentials.error";
import { SupplierRepository } from "../repositories/supplier.repository";

interface AuthenticateUseCaseRequest {
  id: number;
  password: string;
}

interface AuthenticateUseCaseResponse {
  accessToken: string;
  supplier: {
    id: number;
    companyName: string;
  };
}

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private supplierRepository: SupplierRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    id,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const supplier = await this.supplierRepository.findById(id);

    if (!supplier) {
      throw new WrongCredentialsError();
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      supplier.password,
    );

    if (!isPasswordValid) {
      throw new WrongCredentialsError();
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: supplier.id,
      },
      {
        expiresIn: "1d",
      },
    );

    return {
      accessToken,
      supplier: {
        id,
        companyName: supplier.companyName,
      },
    };
  }
}
