import { IStoreCategoryRepository } from "../../../domain/repositories/store-category.repository.interface";
import { StoreCategory } from "../../../domain/entities/store-category.entity";

/**
 * Use Case: GetStoreCategories
 * Recupera todas las categorías personalizadas de una tienda.
 */
export class GetStoreCategoriesUseCase {
  constructor(private readonly repository: IStoreCategoryRepository) {}

  async execute(storeId: string): Promise<StoreCategory[]> {
    if (!storeId) throw new Error("El ID de la tienda es requerido.");
    return this.repository.findByStoreId(storeId);
  }
}
