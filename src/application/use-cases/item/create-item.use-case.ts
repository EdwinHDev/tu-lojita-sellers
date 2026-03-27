import { IItemRepository } from "../../../domain/repositories/item.repository.interface";
import { Item, CreateItemPayload } from "../../../domain/entities/item.entity";

/**
 * Use Case: CreateItem
 * Gestiona la creación de un nuevo item (producto o servicio) en la plataforma.
 */
export class CreateItemUseCase {
  constructor(private readonly repository: IItemRepository) {}

  async execute(payload: CreateItemPayload): Promise<Item> {
    // Validaciones base
    if (!payload.title.trim()) throw new Error("El título del item es requerido.");
    if (!payload.description.trim()) throw new Error("La descripción es requerida.");
    if (!payload.images || payload.images.length === 0) {
      throw new Error("Debe proporcionar al menos una imagen.");
    }

    // Lógica específica por tipo
    if (payload.trackInventory && (payload.stockQuantity === undefined || payload.stockQuantity < 0)) {
      throw new Error("Si rastrea el inventario, la cantidad debe ser 0 o mayor.");
    }

    return this.repository.create(payload);
  }
}
