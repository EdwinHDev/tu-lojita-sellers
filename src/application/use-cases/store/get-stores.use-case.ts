import type { IStoreRepository } from "@/domain/repositories/store.repository.interface";
import type { PaginatedStoresResponse, StoreFilters } from "@/domain/entities/store.entity";

/**
 * Caso de Uso: Obtener una lista paginada de tiendas.
 * Permite aplicar filtros de categoría, ubicación y búsqueda.
 */
export class GetStoresUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(filters: StoreFilters): Promise<PaginatedStoresResponse> {
    return this.storeRepository.getStores(filters);
  }
}
