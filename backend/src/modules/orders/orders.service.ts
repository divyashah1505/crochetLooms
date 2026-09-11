import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { Address } from '../addresses/entities/address.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { MailService } from '../notifications/mail.service';
import { WhatsappService } from '../notifications/whatsapp.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly mailService: MailService,
    private readonly whatsappService: WhatsappService,
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CR-${timestamp}-${random}`;
  }

  async createOrderFromCart(customerId: string, dto: CreateOrderDto) {
    // 1. Verify address belongs to customer
    const address = await this.addressRepository.findOne({
      where: { id: dto.addressId, customerId },
    });
    if (!address) {
      throw new NotFoundException('Delivery address not found');
    }

    // Ensure customer profile in DB has contact phone number (e.g. from Google Sign-In)
    if (address.phone) {
      try {
        const customer = await this.customerRepository.findOne({ where: { id: customerId } });
        if (customer && !customer.phone) {
          customer.phone = address.phone;
          await this.customerRepository.save(customer);
        }
      } catch (custErr) {
        console.warn('Could not auto-populate customer phone from address:', custErr);
      }
    }

    // 2. Fetch cart with items and products
    const cart = await this.cartRepository.findOne({
      where: { customerId },
      relations: ['items', 'items.product', 'items.product.images'],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    // 3. Verify stock and calculate verified DB total amount
    let subtotal = 0;
    for (const item of cart.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        throw new BadRequestException(`Product "${item.product?.name || item.productId}" is unavailable`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        );
      }

      subtotal += Number(product.price) * item.quantity;
    }

    const shippingFee = 0;
    const totalAmount = Number(subtotal.toFixed(2));

    // 4. Create Order
    const orderNumber = this.generateOrderNumber();
    const order = this.orderRepository.create({
      customerId,
      addressId: dto.addressId,
      orderNumber,
      totalAmount,
      status: OrderStatus.PENDING,
      notes: dto.notes,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 5. Create Order Items snapshot
    const orderItems = cart.items.map((item) => {
      const mainImage = item.product.images && item.product.images.length > 0 ? item.product.images[0].imageUrl : null;
      return this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: mainImage,
        price: Number(item.product.price),
        quantity: item.quantity,
      });
    });

    await this.orderItemRepository.save(orderItems);

    // 6. Create Initial Payment record
    const payment = this.paymentRepository.create({
      orderId: savedOrder.id,
      amount: totalAmount,
      status: PaymentStatus.PENDING,
      paymentMethod: 'razorpay',
    });
    await this.paymentRepository.save(payment);

    // 7. Clear customer cart
    await this.cartItemRepository.delete({ cartId: cart.id });

    return this.findOneForCustomer(customerId, savedOrder.id);
  }

  async findAllForCustomer(customerId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { customerId },
      relations: ['items', 'items.product', 'address', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForCustomer(customerId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, customerId },
      relations: ['items', 'items.product', 'address', 'payment'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async findAllForAdmin(status?: OrderStatus, search?: string) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.payment', 'payment')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(order.orderNumber LIKE :search OR customer.name LIKE :search OR customer.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    return qb.getMany();
  }

  async findOneForAdmin(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'address', 'items', 'items.product', 'payment'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOneForAdmin(id);
    const previousStatus = order.status;
    order.status = dto.status;
    const updated = await this.orderRepository.save(order);

    // If order was moved to CONFIRMED and wasn't already CONFIRMED, dispatch confirmation notifications
    if (dto.status === OrderStatus.CONFIRMED && previousStatus !== OrderStatus.CONFIRMED) {
      try {
        const fullOrder = await this.orderRepository.findOne({
          where: { id: updated.id },
          relations: ['customer', 'address', 'items', 'payment'],
        });
        if (fullOrder) {
          this.mailService.sendOrderConfirmationNotifications(fullOrder).catch((err) => {
            console.error('Failed to send status confirmation emails:', err?.message || err);
          });
          this.whatsappService.sendOrderConfirmationWhatsApp(fullOrder).catch((err) => {
            console.error('Failed to send status confirmation WhatsApp:', err?.message || err);
          });
        }
      } catch (err: any) {
        console.error('Order notification trigger error on status update:', err?.message || err);
      }
    }

    return updated;
  }
}
