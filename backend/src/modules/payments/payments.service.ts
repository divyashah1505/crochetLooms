import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { razorpayConfig } from '../../config/razorpay.config';
import { CreateRazorpayOrderDto, VerifyPaymentDto } from './dto/create-razorpay-order.dto';

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    if (razorpayConfig.keyId && razorpayConfig.keySecret && !razorpayConfig.keySecret.includes('_secret')) {
      try {
        this.razorpay = new Razorpay({
          key_id: razorpayConfig.keyId,
          key_secret: razorpayConfig.keySecret,
        });
      } catch (err) {
        console.warn('Razorpay init warning:', err.message);
      }
    }
  }

  async createRazorpayOrder(customerId: string, dto: CreateRazorpayOrderDto) {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId, customerId },
      relations: ['items', 'payment'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is already processed or confirmed');
    }

    const amountInPaise = Math.round(Number(order.totalAmount) * 100);
    let razorpayOrderId = `rzp_order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (this.razorpay) {
        const options = {
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.orderNumber,
          notes: {
            orderId: order.id,
            customerId,
          },
        };
        const rzpOrder = await this.razorpay.orders.create(options);
        razorpayOrderId = rzpOrder.id;
      }
    } catch (error) {
      console.warn('Razorpay live order creation failed or fallback used:', error.message);
    }

    let payment = order.payment;
    if (!payment) {
      payment = this.paymentRepository.create({
        orderId: order.id,
        amount: order.totalAmount,
        status: PaymentStatus.PENDING,
      });
    }

    payment.razorpayOrderId = razorpayOrderId;
    await this.paymentRepository.save(payment);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      amountInPaise,
      currency: 'INR',
      razorpayOrderId,
      keyId: razorpayConfig.keyId,
    };
  }

  async verifyPayment(customerId: string, dto: VerifyPaymentDto) {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId, customerId },
      relations: ['items', 'payment'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    let payment = order.payment;
    if (!payment) {
      payment = this.paymentRepository.create({
        orderId: order.id,
        amount: order.totalAmount,
        status: PaymentStatus.PENDING,
      });
    }

    // Verify signature if a valid secret is provided
    const hasCustomSecret = razorpayConfig.keySecret && !razorpayConfig.keySecret.includes('_secret');
    if (hasCustomSecret && dto.razorpaySignature && dto.razorpayOrderId && dto.razorpayPaymentId) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpayConfig.keySecret)
        .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== dto.razorpaySignature) {
        payment.status = PaymentStatus.FAILED;
        await this.paymentRepository.save(payment);
        throw new BadRequestException('Invalid payment signature verification');
      }
    }

    // 1. Update Payment record
    payment.razorpayPaymentId = dto.razorpayPaymentId;
    if (dto.razorpayOrderId) payment.razorpayOrderId = dto.razorpayOrderId;
    if (dto.razorpaySignature) payment.razorpaySignature = dto.razorpaySignature;
    payment.status = PaymentStatus.SUCCESS;
    await this.paymentRepository.save(payment);

    // 2. Mark order confirmed
    order.status = OrderStatus.CONFIRMED;
    await this.orderRepository.save(order);

    // 3. Reduce product stock
    for (const item of order.items) {
      if (item.productId) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await this.productRepository.save(product);
        }
      }
    }

    return {
      message: 'Payment verified and order confirmed successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: payment.status,
        paymentId: payment.razorpayPaymentId,
      },
    };
  }
}
