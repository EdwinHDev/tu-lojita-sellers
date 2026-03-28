import { IItemRepository } from "../../../domain/repositories/item.repository.interface";
import { Item, ItemFilters, PaginatedItemsResponse } from "../../../domain/entities/item.entity";

/**
 * Use Case: GetItems
 * Obtiene el listado de todos los items de una tienda.
 */
export class GetItemsUseCase {
  constructor(private readonly repository: IItemRepository) {}

  async execute(storeId: string, filters: Partial<ItemFilters> = {}): Promise<PaginatedItemsResponse> {
    if (!storeId) throw new Error("El ID de la tienda es requerido.");
    return this.repository.findAll({ ...filters, storeId });
  }
}
