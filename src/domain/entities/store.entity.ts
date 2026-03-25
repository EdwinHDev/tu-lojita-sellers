/**
 * Representa la respuesta del endpoint /users/check/has-store
 */
export interface HasStoreResponse {
  hasStore: boolean;
  storeId: string | null;
  storeName: string | null;
}

/**
 * Payload necesario para crear una nueva tienda en el backend.
 * Todos los campos son requeridos salvo logo (URL opcional).
 */
export interface CreateStorePayload {
  name: string;
  description: string;
  rif: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  logo: string;
  categoryId: string;
}

/**
 * Entidad de Dominio: Store
 * Refleja la respuesta del backend al crear/obtener una tienda.
 */
export interface Store {
  id: string;
  name: string;
  description: string;
  rif: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  logo: string;
  categoryId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
