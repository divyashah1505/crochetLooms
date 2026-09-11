import { Controller, Post, Get, Patch, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { CustomerJwtGuard } from '../../common/guards/customer-jwt.guard';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { Customer } from '../customers/entities/customer.entity';

@Controller('customer/auth')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterCustomerDto) {
    return this.customerAuthService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginCustomerDto) {
    return this.customerAuthService.login(loginDto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() googleDto: GoogleLoginDto) {
    return this.customerAuthService.googleLogin(googleDto);
  }

  @Get('profile')
  @UseGuards(CustomerJwtGuard)
  async getProfile(@CurrentCustomer() customer: Customer) {
    return this.customerAuthService.getProfile(customer.id);
  }

  @Patch('profile')
  @UseGuards(CustomerJwtGuard)
  async updateProfile(
    @CurrentCustomer() customer: Customer,
    @Body() updateDto: UpdateCustomerProfileDto,
  ) {
    return this.customerAuthService.updateProfile(customer.id, updateDto);
  }
}
