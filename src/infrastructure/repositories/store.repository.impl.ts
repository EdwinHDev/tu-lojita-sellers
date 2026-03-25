import type { IStoreRepository } from "@/domain/repositories/store.repository.interface";
import type { HasStoreResponse, CreateStorePayload, Store } from "@/domain/entities/store.entity";
import { axiosClient } from "@/infrastructure/http/axios.client";
import axios from "axios";

/**
 * Implementación del Repositorio de Tiendas.
 * Conecta el dominio con el backend a través del axiosClient autenticado.
 */
export class StoreRepositoryImpl implements IStoreRepository {
  /**
   * GET /users/check/has-store
   * El interceptor de Axios inyecta el Bearer token automáticamente.
   */
  async checkHasStore(): Promise<HasStoreResponse> {
    const response = await axiosClient.get<HasStoreResponse>("/users/check/has-store");
    return response.data;
  }

  /**
   * POST /stores
   * Crea la tienda con el payload completo del wizard.
   * En caso de error 400, extrae el mensaje de validación del backend.
   */
  async createStore(payload: CreateStorePayload): Promise<Store> {
    try {
      const response = await axiosClient.post<Store>("/stores", payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const serverData = error.response.data;

        const message: string =
          (Array.isArray(serverData?.message) ? serverData.message.join(" | ") : null) ??
          (typeof serverData?.message === "string" ? serverData.message : null) ??
          serverData?.error ??
          `Error ${status} del servidor.`;

        throw new Error(message);
      }
      throw error;
    }
  }
}

