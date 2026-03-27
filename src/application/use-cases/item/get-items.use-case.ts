import { IItemRepository } from "../../../domain/repositories/item.repository.interface";
import { Item } from "../../../domain/entities/item.entity";

/**
 * Use Case: GetItems
 * Obtiene el listado de todos los items de una tienda.
 */
export class GetItemsUseCase {
  constructor(private readonly repository: IItemRepository) {}

  async execute(storeId: string): Promise<Item[]> {
    if (!storeId) throw new Error("El ID de la tienda es requerido.");
    return this.repository.findByStoreId(storeId);
  }
}
