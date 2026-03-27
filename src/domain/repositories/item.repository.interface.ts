import { Item, CreateItemPayload } from "../entities/item.entity";

/**
 * Interface para el Repositorio de Items.
 */
export interface IItemRepository {
  /**
   * Crea un nuevo item (producto o servicio) en una tienda.
   */
  create(payload: CreateItemPayload): Promise<Item>;

  /**
   * Obtiene todos los items de una tienda específica.
   */
  findByStoreId(storeId: string): Promise<Item[]>;

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
