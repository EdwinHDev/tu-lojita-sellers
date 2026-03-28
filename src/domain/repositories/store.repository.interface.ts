import type { HasStoreResponse, CreateStorePayload, Store, UpdateStorePayload, PaginatedStoresResponse, StoreFilters } from "@/domain/entities/store.entity";

/**
 * Contrato del Repositorio de Tiendas.
 * El dominio no sabe nada de Axios ni cookies — solo consume esta interfaz.
 */
export interface IStoreRepository {
  /**
   * Consulta al backend si el usuario autenticado ya tiene una tienda registrada.
   */
  checkHasStore(): Promise<HasStoreResponse>;

  /**
   * Crea una nueva tienda en el backend con el payload completo.
   */
  createStore(payload: CreateStorePayload): Promise<Store>;

  /**
   * Obtiene la información completa de una tienda por su ID.
   */
  getStoreById(id: string): Promise<Store>;

  /**
   * Actualiza la información de una tienda.
   * @param id ID de la tienda
   * @param payload Datos a actualizar
   */
  updateStore(id: string, payload: UpdateStorePayload): Promise<Store>;
  
  /**
   * Obtiene una lista paginada de tiendas filtradas.
   */
  getStores(filters: StoreFilters): Promise<PaginatedStoresResponse>;
}
