import { StoreCategory, CreateStoreCategoryPayload } from "../entities/store-category.entity";

/**
 * Interface para el Repositorio de Categorías de Tienda.
 */
export interface IStoreCategoryRepository {
  /**
   * Crea una nueva categoría para una tienda.
   */
  create(payload: CreateStoreCategoryPayload): Promise<StoreCategory>;

  /**
   * Obtiene todas las categorías de una tienda específica.
   */
  findByStoreId(storeId: string): Promise<StoreCategory[]>;

  /**
   * Actualiza una categoría existente.
   */
  update(id: string, payload: Partial<CreateStoreCategoryPayload>): Promise<StoreCategory>;

  /**
   * Elimina una categoría por su ID.
   */
  delete(id: string): Promise<void>;
}
