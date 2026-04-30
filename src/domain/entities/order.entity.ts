import { Store } from "./store.entity";
import { Item } from "./item.entity";

export enum OrderStatus {
  PENDING = "PENDING",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  FULLY_PAID = "FULLY_PAID",
  CANCELLED = "CANCELLED",
}

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  item?: Item;
}

export interface OrderUser {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Order {
  id: string;
  totalAmount: number;
  feeAmount: number;
  finalAmount: number;
  balance: number;
  isPartialPayment: boolean;
  status: OrderStatus;
  monthlyDueDay?: number | null;
  nextDueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  store?: Store;
  user?: OrderUser;
  orderItems?: OrderItem[];
  payments?: any[]; // Will type this fully when we create payment.entity.ts to avoid circular deps if not needed, though we can define a basic interface or just import Payment.
}

export interface OrderFilters {
  limit?: number;
  offset?: number;
  status?: OrderStatus;
  storeId?: string;
  userId?: string;
  isPartialPayment?: boolean;
  hasBalance?: boolean;
  startDate?: string;
  endDate?: string;
  q?: string;
  sort?: string;
  order?: "ASC" | "DESC";
}

export interface PaginatedOrdersResponse {
  items: Order[];
  total: number;
  limit: number;
  offset: number;
}
