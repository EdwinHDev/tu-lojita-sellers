import { Category } from "../entities/category.entity";

/**
 * Interface for Category Repository
 */
export interface ICategoryRepository {
  /**
   * Fetches all available categories from the backend
   */
  findAll(): Promise<Category[]>;
}
