import { Payment, VerifyPaymentPayload } from "../entities/payment.entity";

export interface IPaymentRepository {
  getPayments(storeId?: string): Promise<Payment[]>;
  verifyPayment(id: string, payload: VerifyPaymentPayload): Promise<Payment>;
}
