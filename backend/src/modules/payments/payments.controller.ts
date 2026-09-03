import { Controller, Post, Body, Headers, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateRazorpayOrderDto, VerifyPaymentDto } from './dto/create-razorpay-order.dto';
import { CustomerJwtGuard } from '../../common/guards/customer-jwt.guard';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { Customer } from '../customers/entities/customer.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-razorpay-order')
  @UseGuards(CustomerJwtGuard)
  async createRazorpayOrder(
    @CurrentCustomer() customer: Customer,
    @Body() dto: CreateRazorpayOrderDto,
  ) {
    return this.paymentsService.createRazorpayOrder(customer.id, dto);
  }

  @Post('verify')
  @UseGuards(CustomerJwtGuard)
  async verifyPayment(
    @CurrentCustomer() customer: Customer,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(customer.id, dto);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    return this.paymentsService.handleWebhook(body, signature);
  }
}
