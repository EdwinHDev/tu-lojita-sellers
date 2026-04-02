import { IOrderRepository } from "@/domain/repositories/order.repository.interface";
import { OrderFilters, PaginatedOrdersResponse } from "@/domain/entities/order.entity";

export class GetStoreOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(filters: OrderFilters): Promise<PaginatedOrdersResponse> {
    // If we receive the raw array or a paginated response, handle it.
    // Assuming backend returns an array if no pagination params, or PaginatedOrdersResponse.
    // The dto for OrderPaginationDto extends PaginationDto, so backend handles pagination.
    return await this.orderRepository.getOrders(filters);
  }
}
