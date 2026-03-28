import { axiosClient } from "../http/axios.client";
import { IItemRepository } from "../../domain/repositories/item.repository.interface";
import { Item, CreateItemPayload, ItemFilters, PaginatedItemsResponse } from "../../domain/entities/item.entity";

/**
 * Implementación de IItemRepository usando axiosClient.
 */
export class ItemRepositoryImpl implements IItemRepository {
  async create(payload: CreateItemPayload): Promise<Item> {
    const response = await axiosClient.post<Item>("/items", payload);
    return response.data;
  }

  async findByStoreId(storeId: string): Promise<Item[]> {
    const response = await axiosClient.get<Item[]>(`/items/store/${storeId}`);
    return response.data;
  }

  async findAll(filters: ItemFilters): Promise<PaginatedItemsResponse> {
    const response = await axiosClient.get<PaginatedItemsResponse>("/items", {
      params: filters,
    });
    return response.data;
  }

  async findById(id: string): Promise<Item> {
    const response = await axiosClient.get<Item>(`/items/${id}`);
    return response.data;
  }

  async update(id: string, payload: Partial<CreateItemPayload>): Promise<Item> {
    const response = await axiosClient.patch<Item>(`/items/${id}`, payload);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/items/${id}`);
  }
}
