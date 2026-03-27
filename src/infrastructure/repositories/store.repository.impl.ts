import type { IStoreRepository } from "@/domain/repositories/store.repository.interface";
import type { HasStoreResponse, CreateStorePayload, Store, UpdateStorePayload } from "@/domain/entities/store.entity";
import { axiosClient } from "@/infrastructure/http/axios.client";
import axios from "axios";

/**
 * Implementación del Repositorio de Tiendas.
 * Conecta el dominio con el backend a través del axiosClient autenticado.
 */
export class StoreRepositoryImpl implements IStoreRepository {
  /**
   * GET /users/check/has-store
   */
  async checkHasStore(): Promise<HasStoreResponse> {
    const response = await axiosClient.get<HasStoreResponse>("/users/check/has-store");
    return response.data;
  }

  /**
   * POST /stores
   */
  async createStore(payload: CreateStorePayload): Promise<Store> {
    try {
      const response = await axiosClient.post<Store>("/stores", payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const serverData = error.response.data;
        const message = serverData?.message || serverData?.error || "Error al crear la tienda.";
        throw new Error(Array.isArray(message) ? message.join(" | ") : message);
      }
      throw error;
    }
  }

  /**
   * GET /stores/:id
   */
  async getStoreById(id: string): Promise<Store> {
    const response = await axiosClient.get<Store>(`/stores/${id}`);
    return response.data;
  }

  /**
   * PATCH /stores/:id
   */
  async updateStore(id: string, payload: UpdateStorePayload): Promise<Store> {
    try {
      const response = await axiosClient.patch<Store>(`/stores/${id}`, payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const serverData = error.response.data;
        const message = serverData?.message || serverData?.error || "Error al actualizar la tienda.";
        throw new Error(Array.isArray(message) ? message.join(" | ") : message);
      }
      throw error;
    }
  }
}
