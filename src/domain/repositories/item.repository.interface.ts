import { Item, CreateItemPayload, ItemFilters, PaginatedItemsResponse } from "../entities/item.entity";

/**
 * Interface para el Repositorio de Items.
 */
export interface IItemRepository {
  /**
   * Crea un nuevo item (producto o servicio) en una tienda.
   */
  create(payload: CreateItemPayload): Promise<Item>;

  /**
   * Obtiene todos los items de una tienda específica (mantenido por compatibilidad).
   */
  findByStoreId(storeId: string): Promise<Item[]>;

  /**
   * Obtiene todos los items con soporte para filtros y paginación.
   */
  findAll(filters: ItemFilters): Promise<PaginatedItemsResponse>;

  /**
   * Obtiene un item por su ID.
   */
  findById(id: string): Promise<Item>;

  /**
   * Actualiza un item existente.
   */
  update(id: string, payload: Partial<CreateItemPayload>): Promise<Item>;

  /**
   * Elimina un item por su ID.
   */
  delete(id: string): Promise<void>;
}
