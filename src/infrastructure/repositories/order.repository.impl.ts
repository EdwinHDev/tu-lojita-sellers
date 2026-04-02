import { IOrderRepository } from "@/domain/repositories/order.repository.interface";
import { Order, OrderFilters, PaginatedOrdersResponse } from "@/domain/entities/order.entity";
import { axiosClient } from "../http/axios.client";

export class OrderRepositoryImpl implements IOrderRepository {
  async getOrders(filters: OrderFilters): Promise<PaginatedOrdersResponse> {
    const { data } = await axiosClient.get<PaginatedOrdersResponse>("/order", {
      params: filters,
    });
    return data;
  }

  async getOrderById(id: string): Promise<Order> {
    const { data } = await axiosClient.get<Order>(`/order/${id}`);
    return data;
  }
}
