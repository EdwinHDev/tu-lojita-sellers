import { IStoreRepository } from "../../../domain/repositories/store.repository.interface";
import { Store } from "../../../domain/entities/store.entity";

/**
 * Caso de Uso: Obtener información de una tienda.
 */
export class GetStoreUseCase {
  constructor(private readonly repository: IStoreRepository) {}

  async execute(id: string): Promise<Store> {
    if (!id) throw new Error("El ID de la tienda es obligatorio.");
    return this.repository.getStoreById(id);
  }
}
