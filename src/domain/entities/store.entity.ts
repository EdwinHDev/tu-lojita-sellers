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
 * Payload para actualizar una tienda.
 * El RIF NO puede ser actualizado según requerimientos de negocio.
 */
export interface UpdateStorePayload {
  name?: string;
  description?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  logo?: string;
  categoryId?: string;
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
  categoryId: string; // Puede venir plano o dentro del objeto category
  category?: {
    id: string;
    name: string;
  };
  ownerId: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  createdAt: string;
  updatedAt: string;
}
