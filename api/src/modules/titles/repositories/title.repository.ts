import { Title } from "../entities/title.entity";
export abstract class TitlesRepository {
  abstract findPendingBySupplierId(supplierId: number): Promise<Title[]>;
}
