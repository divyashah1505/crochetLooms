import { apiClient } from './api';

export const paymentService = {
  async createRazorpayOrder(orderId: string) {
    const res = await apiClient.post('/payments/create-razorpay-order', { orderId });
    return res.data as {
      orderId: string;
      orderNumber: string;
      amount: number;
      amountInPaise: number;
      currency: string;
      razorpayOrderId: string;
      keyId: string;
    };
  },

  async verifyPayment(payload: {
    orderId: string;
    razorpayPaymentId: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
  }) {
    const res = await apiClient.post('/payments/verify', payload);
    return res.data;
  },
};
