import { ICategoryRepository } from "@/domain/repositories/category.repository.interface";
import { Category } from "@/domain/entities/category.entity";

/**
 * Concrete implementation of ICategoryRepository using the fetch API.
 */
export class CategoryRepositoryImpl implements ICategoryRepository {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500/api/v1";
  }

  async findAll(): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/categories`, {
      method: "GET",
      // Adding cache control if needed for Next.js App Router
      next: { revalidate: 3600 }, 
    });

    if (!response.ok) {
      throw new Error("No se pudieron cargar las categorías desde el servidor.");
    }

    return response.json();
  }
}
