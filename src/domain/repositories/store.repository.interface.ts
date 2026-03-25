import type { HasStoreResponse, CreateStorePayload, Store } from "@/domain/entities/store.entity";

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
}
