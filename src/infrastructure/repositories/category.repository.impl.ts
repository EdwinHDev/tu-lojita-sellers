import { axiosClient } from "../http/axios.client";
import { ICategoryRepository } from "@/domain/repositories/category.repository.interface";
import { Category } from "@/domain/entities/category.entity";

/**
 * Implementación de ICategoryRepository usando axiosClient.
 */
export class CategoryRepositoryImpl implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    const response = await axiosClient.get<Category[]>("/categories");
    return response.data;
  }
}
