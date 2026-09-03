import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRazorpayOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId: string;
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId: string;

  @IsString()
  @IsNotEmpty({ message: 'Razorpay Payment ID is required' })
  razorpayPaymentId: string;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  razorpaySignature?: string;
}
