import { IStoreCategoryRepository } from "../../../domain/repositories/store-category.repository.interface";
import { StoreCategory, CreateStoreCategoryPayload } from "../../../domain/entities/store-category.entity";

/**
 * Caso de Uso: Actualizar una categoría de tienda.
 */
export class UpdateStoreCategoryUseCase {
  constructor(private readonly repository: IStoreCategoryRepository) {}

  async execute(id: string, payload: Partial<CreateStoreCategoryPayload>): Promise<StoreCategory> {
    if (!id) throw new Error("El ID de la categoría es obligatorio.");
    return this.repository.update(id, payload);
  }
}
