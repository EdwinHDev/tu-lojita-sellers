import { IStoreCategoryRepository } from "../../../domain/repositories/store-category.repository.interface";

/**
 * Caso de Uso: Eliminar una categoría de tienda.
 */
export class DeleteStoreCategoryUseCase {
  constructor(private readonly repository: IStoreCategoryRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) throw new Error("El ID de la categoría es obligatorio.");
    return this.repository.delete(id);
  }
}
