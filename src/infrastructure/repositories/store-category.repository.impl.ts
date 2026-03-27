import { axiosClient } from "../http/axios.client";
import { IStoreCategoryRepository } from "../../domain/repositories/store-category.repository.interface";
import { StoreCategory, CreateStoreCategoryPayload } from "../../domain/entities/store-category.entity";

/**
 * Implementación de IStoreCategoryRepository usando axiosClient.
 */
export class StoreCategoryRepositoryImpl implements IStoreCategoryRepository {
  async create(payload: CreateStoreCategoryPayload): Promise<StoreCategory> {
    const response = await axiosClient.post<StoreCategory>("/store-categories", payload);
    return response.data;
  }

  async findByStoreId(storeId: string): Promise<StoreCategory[]> {
    try {
      const response = await axiosClient.get<StoreCategory[]>(`/store-categories/store/${storeId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching item categories:", error);
      return [];
    }
  }

  async update(id: string, payload: Partial<CreateStoreCategoryPayload>): Promise<StoreCategory> {
    const response = await axiosClient.patch<StoreCategory>(`/store-categories/${id}`, payload);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/store-categories/${id}`);
  }
}
