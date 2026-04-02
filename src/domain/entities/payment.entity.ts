import { Store } from "./store.entity";
import { Order, OrderUser } from "./order.entity";

export enum PaymentStatus {
  PENDING = "PENDING",
  WAITING_VERIFICATION = "WAITING_VERIFICATION",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  REFUNDED = "REFUNDED",
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  reference?: string | null;
  receiptImage?: string | null;
  createdAt: string;
  updatedAt: string;
  store?: Store;
  user?: OrderUser;
  order?: Order;
}

export interface VerifyPaymentPayload {
  status: PaymentStatus;
}
