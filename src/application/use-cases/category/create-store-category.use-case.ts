import { IStoreCategoryRepository } from "../../../domain/repositories/store-category.repository.interface";
import { StoreCategory, CreateStoreCategoryPayload } from "../../../domain/entities/store-category.entity";

/**
 * Use Case: CreateStoreCategory
 * Crea una nueva categoría dentro de una tienda específica.
 */
export class CreateStoreCategoryUseCase {
  constructor(private readonly repository: IStoreCategoryRepository) {}

  async execute(payload: CreateStoreCategoryPayload): Promise<StoreCategory> {
    // Validaciones de negocio adicionales pueden ir aquí
    if (!payload.name.trim()) throw new Error("El nombre de la categoría es requerido.");
    if (payload.name.length < 3) throw new Error("El nombre debe tener al menos 3 caracteres.");

    return this.repository.create(payload);
  }
}
