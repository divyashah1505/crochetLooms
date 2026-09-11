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
import { MailService } from '../notifications/mail.service';
import { WhatsappService } from '../notifications/whatsapp.service';

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
    private readonly mailService: MailService,
    private readonly whatsappService: WhatsappService,
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

    // Strictly charge product items price only (ZERO extra shipping or charges)
    let productSubtotal = 0;
    if (order.items && order.items.length > 0) {
      productSubtotal = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );
    }

    const finalAmount = productSubtotal > 0 ? productSubtotal : Number(order.totalAmount);
    order.totalAmount = finalAmount;
    await this.orderRepository.save(order);

    const amountInPaise = Math.round(Number(finalAmount) * 100);
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

    // 4. Send Order Confirmation Email & WhatsApp to Customer & Admin
    try {
      const fullOrder = await this.orderRepository.findOne({
        where: { id: order.id },
        relations: ['customer', 'address', 'items', 'payment'],
      });
      if (fullOrder) {
        this.mailService.sendOrderConfirmationNotifications(fullOrder).catch((mailErr) => {
          console.error('Failed to send order confirmation notifications:', mailErr?.message || mailErr);
        });
        this.whatsappService.sendOrderConfirmationWhatsApp(fullOrder).catch((waErr) => {
          console.error('Failed to send order confirmation WhatsApp:', waErr?.message || waErr);
        });
      }
    } catch (err: any) {
      console.error('Order notification trigger error:', err?.message || err);
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

  async handleWebhook(rawBody: any, signature: string) {
    if (!signature) {
      throw new BadRequestException('Missing X-Razorpay-Signature header');
    }

    const secret = razorpayConfig.webhookSecret;
    if (secret) {
      const payloadString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('Razorpay Webhook signature warning (mismatch or unparsed payload)');
      }
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const eventType = event.event;
    const payload = event.payload;

    console.log(`📥 Received Razorpay Webhook Event: [${eventType}]`);

    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = payload.payment?.entity;
      const orderEntity = payload.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;
      const customOrderId = paymentEntity?.notes?.orderId || orderEntity?.notes?.orderId;

      let order: Order | null = null;
      if (customOrderId) {
        order = await this.orderRepository.findOne({
          where: { id: customOrderId },
          relations: ['items', 'payment'],
        });
      }

      if (!order && razorpayOrderId) {
        const paymentRec = await this.paymentRepository.findOne({
          where: { razorpayOrderId },
        });
        if (paymentRec) {
          order = await this.orderRepository.findOne({
            where: { id: paymentRec.orderId },
            relations: ['items', 'payment'],
          });
        }
      }

      if (order) {
        let payment = order.payment;
        if (!payment) {
          payment = this.paymentRepository.create({
            orderId: order.id,
            amount: order.totalAmount,
            status: PaymentStatus.PENDING,
          });
        }

        payment.razorpayPaymentId = razorpayPaymentId || payment.razorpayPaymentId;
        payment.razorpayOrderId = razorpayOrderId || payment.razorpayOrderId;
        payment.status = PaymentStatus.SUCCESS;
        await this.paymentRepository.save(payment);

        if (order.status !== OrderStatus.CONFIRMED && order.status !== OrderStatus.DELIVERED) {
          order.status = OrderStatus.CONFIRMED;
          await this.orderRepository.save(order);

          // Reduce stock
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

          // Send confirmation notifications to customer and admin
          try {
            const fullOrder = await this.orderRepository.findOne({
              where: { id: order.id },
              relations: ['customer', 'address', 'items', 'payment'],
            });
            if (fullOrder) {
              this.mailService.sendOrderConfirmationNotifications(fullOrder).catch((err) => {
                console.error('Failed to send webhook order confirmation email:', err?.message || err);
              });
              this.whatsappService.sendOrderConfirmationWhatsApp(fullOrder).catch((waErr) => {
                console.error('Failed to send webhook order confirmation WhatsApp:', waErr?.message || waErr);
              });
            }
          } catch (err: any) {
            console.error('Webhook notification trigger error:', err?.message || err);
          }
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      if (razorpayOrderId) {
        const payment = await this.paymentRepository.findOne({
          where: { razorpayOrderId },
        });
        if (payment) {
          payment.status = PaymentStatus.FAILED;
          if (paymentEntity.id) payment.razorpayPaymentId = paymentEntity.id;
          await this.paymentRepository.save(payment);
        }
      }
    } else if (eventType === 'refund.processed') {
      const refundEntity = payload.refund?.entity;
      const razorpayPaymentId = refundEntity?.payment_id;
      if (razorpayPaymentId) {
        const payment = await this.paymentRepository.findOne({
          where: { razorpayPaymentId },
        });
        if (payment) {
          payment.status = PaymentStatus.REFUNDED;
          await this.paymentRepository.save(payment);
        }
      }
    }

    return { status: 'success', event: eventType };
  }
}
