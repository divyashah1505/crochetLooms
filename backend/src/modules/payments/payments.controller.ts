import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateRazorpayOrderDto, VerifyPaymentDto } from './dto/create-razorpay-order.dto';
import { CustomerJwtGuard } from '../../common/guards/customer-jwt.guard';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { Customer } from '../customers/entities/customer.entity';

@Controller('payments')
@UseGuards(CustomerJwtGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-razorpay-order')
  async createRazorpayOrder(
    @CurrentCustomer() customer: Customer,
    @Body() dto: CreateRazorpayOrderDto,
  ) {
    return this.paymentsService.createRazorpayOrder(customer.id, dto);
  }

  @Post('verify')
  async verifyPayment(
    @CurrentCustomer() customer: Customer,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(customer.id, dto);
  }
}
