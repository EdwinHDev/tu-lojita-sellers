import { ICategoryRepository } from "@/domain/repositories/category.repository.interface";
import { Category } from "@/domain/entities/category.entity";

/**
 * Use case to retrieve all categories
 */
export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }
}
