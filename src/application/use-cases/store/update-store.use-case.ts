import { IStoreRepository } from "../../../domain/repositories/store.repository.interface";
import { Store, UpdateStorePayload } from "../../../domain/entities/store.entity";

/**
 * Caso de Uso: Actualizar información de la tienda.
 * Garantiza que solo se envíen campos permitidos y maneja la persistencia.
 */
export class UpdateStoreUseCase {
  constructor(private readonly repository: IStoreRepository) {}

  async execute(id: string, payload: UpdateStorePayload): Promise<Store> {
    if (!id) throw new Error("El ID de la tienda es obligatorio.");

    // Aquí se podrían añadir validaciones adicionales de negocio
    // ej: Validar que el nombre no sea vacío si se envía
    if (payload.name && payload.name.trim().length < 3) {
      throw new Error("El nombre de la tienda debe tener al menos 3 caracteres.");
    }

    return this.repository.updateStore(id, payload);
  }
}
