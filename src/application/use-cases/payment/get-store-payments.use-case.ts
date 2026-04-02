import { IPaymentRepository } from "@/domain/repositories/payment.repository.interface";
import { Payment } from "@/domain/entities/payment.entity";

export class GetStorePaymentsUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(storeId?: string): Promise<Payment[]> {
    return await this.paymentRepository.getPayments(storeId);
  }
}
