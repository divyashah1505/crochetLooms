import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/add-to-cart.dto';
import { CustomerJwtGuard } from '../../common/guards/customer-jwt.guard';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { Customer } from '../customers/entities/customer.entity';

@Controller('cart')
@UseGuards(CustomerJwtGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentCustomer() customer: Customer) {
    return this.cartService.getCartSummary(customer.id);
  }

  @Post('items')
  async addItem(
    @CurrentCustomer() customer: Customer,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(customer.id, dto);
  }

  @Put('items/:id')
  async updateItem(
    @CurrentCustomer() customer: Customer,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(customer.id, itemId, dto);
  }

  @Delete('items/:id')
  async removeItem(
    @CurrentCustomer() customer: Customer,
    @Param('id') itemId: string,
  ) {
    return this.cartService.removeItem(customer.id, itemId);
  }

  @Delete('clear')
  async clearCart(@CurrentCustomer() customer: Customer) {
    return this.cartService.clearCart(customer.id);
  }

  @Delete()
  async clearCartRoot(@CurrentCustomer() customer: Customer) {
    return this.cartService.clearCart(customer.id);
  }
}
