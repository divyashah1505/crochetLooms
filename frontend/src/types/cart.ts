import { Product } from './product';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface CartSummary {
  id: string;
  customerId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
}
