import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AdminsModule } from './modules/admins/admins.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CustomerAuthModule } from './modules/customer-auth/customer-auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AdminsModule,
    AdminAuthModule,
    CustomersModule,
    CustomerAuthModule,
    CategoriesModule,
    TagsModule,
    ProductsModule,
    CartModule,
    AddressesModule,
    OrdersModule,
    PaymentsModule,
    UploadsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
