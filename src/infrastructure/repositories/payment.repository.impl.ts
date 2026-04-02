import { IPaymentRepository } from "@/domain/repositories/payment.repository.interface";
import { Payment, VerifyPaymentPayload } from "@/domain/entities/payment.entity";
import { axiosClient } from "../http/axios.client";

export class PaymentRepositoryImpl implements IPaymentRepository {
  async getPayments(storeId?: string): Promise<Payment[]> {
    const { data } = await axiosClient.get<Payment[]>("/payment", {
      params: { storeId },
    });
    return data;
  }

  async verifyPayment(id: string, payload: VerifyPaymentPayload): Promise<Payment> {
    const { data } = await axiosClient.post<Payment>(`/payment/${id}/verify`, payload);
    return data;
  }
}
