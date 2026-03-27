import { Store } from "./store.entity";

/**
 * Entidad de Dominio: StoreCategory
 * Representa una categoría personalizada dentro de una tienda.
 */
export interface StoreCategory {
  id: string;
  name: string;
  description: string;
  storeId: string;
  store?: Store;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload para crear una categoría de tienda.
 */
export interface CreateStoreCategoryPayload {
  name: string;
  description: string;
  storeId: string;
}
