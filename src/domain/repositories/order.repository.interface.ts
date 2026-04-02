import { Order, OrderFilters, PaginatedOrdersResponse } from "../entities/order.entity";

export interface IOrderRepository {
  getOrders(filters: OrderFilters): Promise<PaginatedOrdersResponse>;
  getOrderById(id: string): Promise<Order>;
}
