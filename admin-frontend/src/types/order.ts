import { Address, Customer } from './user';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod: string;
}

export interface Order {
  id: string;
  customerId: string;
  addressId?: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  customer?: Customer;
  address?: Address;
  items: OrderItem[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}
