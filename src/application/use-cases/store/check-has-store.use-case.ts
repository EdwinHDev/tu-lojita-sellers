import type { IStoreRepository } from "@/domain/repositories/store.repository.interface";
import type { HasStoreResponse } from "@/domain/entities/store.entity";

/**
 * Use Case: CheckHasStore
 * Determina si el usuario autenticado posee al menos una tienda registrada.
 */
export class CheckHasStoreUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(): Promise<HasStoreResponse> {
    return this.storeRepository.checkHasStore();
  }
}
