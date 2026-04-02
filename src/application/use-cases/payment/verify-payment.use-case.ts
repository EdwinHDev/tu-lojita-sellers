import { IPaymentRepository } from "@/domain/repositories/payment.repository.interface";
import { Payment, PaymentStatus } from "@/domain/entities/payment.entity";

export class VerifyPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(id: string, status: PaymentStatus): Promise<Payment> {
    return await this.paymentRepository.verifyPayment(id, { status });
  }
}
