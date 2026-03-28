/**
 * Representa la respuesta del endpoint /users/check/has-store
 */
export interface HasStoreResponse {
  hasStore: boolean;
  storeId: string | null;
  storeName: string | null;
}

export interface CreateStoreAddressPayload {
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
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
  mainAddress?: CreateStoreAddressPayload;
  logo: string;
  subCategoryId: string;
}

/**
 * Payload para actualizar una tienda.
 * El RIF NO puede ser actualizado según requerimientos de negocio.
 */
export interface UpdateStorePayload {
  name?: string;
  description?: string;
  phone?: string;
  mainAddress?: CreateStoreAddressPayload;
  logo?: string;
  subCategoryId?: string;
}

export interface StoreAddress {
  id: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  isMain?: boolean;
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
  addresses?: StoreAddress[];
  logo: string;
  subcategory?: {
    id: string;
    name: string;
    category?: {
      id: string;
      name: string;
    }
  };
  ownerId: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  slug: string;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Filtros para la consulta de tiendas.
 */
export interface StoreFilters {
  limit?: number;
  offset?: number;
  categoryId?: string;
  city?: string;
  state?: string;
  q?: string;
  sort?: string;
  order?: "ASC" | "DESC";
}

/**
 * Respuesta paginada de tiendas.
 */
export interface PaginatedStoresResponse {
  data: Store[];
  total: number;
  limit: number;
  offset: number;
}
