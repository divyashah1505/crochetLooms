import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CustomersModule } from '../customers/customers.module';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';

@Module({
  imports: [
    CustomersModule,
    PassportModule.register({ defaultStrategy: 'customer-jwt' }),
    JwtModule.register({}),
  ],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, CustomerJwtStrategy],
  exports: [CustomerAuthService, CustomerJwtStrategy, PassportModule],
})
export class CustomerAuthModule {}
