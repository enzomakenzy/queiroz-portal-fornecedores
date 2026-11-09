import { Supplier } from "../entities/supplier.entity";

export abstract class SupplierRepository {
  abstract findById(id: number): Promise<Supplier | null>;
}
