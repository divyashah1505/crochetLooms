import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { CustomerJwtGuard } from '../../common/guards/customer-jwt.guard';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { Customer } from '../customers/entities/customer.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Customer: Checkout create order from cart
  @Post()
  @UseGuards(CustomerJwtGuard)
  async createOrder(
    @CurrentCustomer() customer: Customer,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.ordersService.createOrderFromCart(customer.id, dto);
    return {
      message: 'Order placed successfully',
      data: order,
    };
  }

  // Customer: Get own orders
  @Get()
  @UseGuards(CustomerJwtGuard)
  async getCustomerOrders(@CurrentCustomer() customer: Customer) {
    return this.ordersService.findAllForCustomer(customer.id);
  }

  // Customer: Get single order details
  @Get(':id')
  @UseGuards(CustomerJwtGuard)
  async getCustomerOrder(
    @CurrentCustomer() customer: Customer,
    @Param('id') id: string,
  ) {
    return this.ordersService.findOneForCustomer(customer.id, id);
  }

  // Admin: Get all orders across customers
  @Get('admin/all')
  @UseGuards(AdminJwtGuard)
  async getAllOrdersAdmin(
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAllForAdmin(status, search);
  }

  // Admin: Get single order
  @Get('admin/:id')
  @UseGuards(AdminJwtGuard)
  async getOrderAdmin(@Param('id') id: string) {
    return this.ordersService.findOneForAdmin(id);
  }

  // Admin: Update order status
  @Patch('admin/:id/status')
  @UseGuards(AdminJwtGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const updated = await this.ordersService.updateStatus(id, dto);
    return {
      message: 'Order status updated successfully',
      data: updated,
    };
  }
}
