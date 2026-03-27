import { Store } from "./store.entity";
import { StoreCategory } from "./store-category.entity";

/**
 * Tipos de items disponibles en la plataforma.
 */
export enum ItemType {
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE",
}

/**
 * Atributos dinámicos base.
 */
export interface BaseAttributes {
  brand?: string;
  tags?: string[];
}

/**
 * Atributos específicos para alimentos.
 */
export interface FoodAttributes extends BaseAttributes {
  isVegan?: boolean;
  calories?: number;
  allergens?: string[];
  ingredients?: string[];
}

/**
 * Atributos específicos para servicios.
 */
export interface ServiceAttributes extends BaseAttributes {
  durationMinutes?: number;
  modality?: "IN_PERSON" | "ONLINE" | "AT_HOME";
  includesMaterials?: boolean;
}

/**
 * Atributos específicos para productos físicos.
 */
export interface PhysicalProductAttributes extends BaseAttributes {
  color?: string;
  size?: string;
  material?: string;
  weightKg?: number;
}

/**
 * Tipo unión para atributos de items.
 */
export type ItemAttributes = 
  | FoodAttributes 
  | ServiceAttributes 
  | PhysicalProductAttributes 
  | Record<string, any>;

/**
 * Entidad de Dominio: Item
 * Representa un producto o servicio que una tienda ofrece.
 */
export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  itemType: ItemType;
  trackInventory: boolean;
  stockQuantity?: number;
  requiresBooking: boolean;
  attributes: ItemAttributes;
  storeId: string;
  store?: Store;
  categoryId?: string;
  category?: StoreCategory;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload para crear un nuevo item.
 */
export interface CreateItemPayload {
  title: string;
  storeId: string;
  categoryId?: string;
  description: string;
  price?: number;
  images: string[];
  itemType: ItemType;
  trackInventory?: boolean;
  stockQuantity?: number;
  requiresBooking?: boolean;
  attributes?: ItemAttributes;
}
