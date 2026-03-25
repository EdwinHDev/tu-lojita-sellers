import type { IStoreRepository } from "@/domain/repositories/store.repository.interface";
import type { CreateStorePayload, Store } from "@/domain/entities/store.entity";

/**
 * Use Case: CreateStore
 * Registra una nueva tienda en el backend con todos los datos del wizard.
 */
export class CreateStoreUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(payload: CreateStorePayload): Promise<Store> {
    // Validación de negocio mínima en el dominio antes de llegar a la red
    if (!payload.name || payload.name.trim().length < 3) {
      throw new Error("El nombre de la tienda debe tener al menos 3 caracteres.");
    }
    if (!payload.description || payload.description.trim().length < 20) {
      throw new Error("La descripción debe tener al menos 20 caracteres.");
    }
    if (!payload.rif || !/^[A-Z]-\d{8}-\d$/.test(payload.rif)) {
      throw new Error("El RIF debe tener el formato correcto (ej. J-12345678-0).");
    }
    if (!payload.categoryId) {
      throw new Error("Debes seleccionar una categoría para tu tienda.");
    }

    return this.storeRepository.createStore(payload);
  }
}
