import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductImage } from '../../modules/products/entities/product-image.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Tag } from '../../modules/tags/entities/tag.entity';
import { Admin } from '../../modules/admins/entities/admin.entity';
import { Customer } from '../../modules/customers/entities/customer.entity';
import { Cart } from '../../modules/cart/entities/cart.entity';
import { CartItem } from '../../modules/cart/entities/cart-item.entity';
import { Address } from '../../modules/addresses/entities/address.entity';
import { Order } from '../../modules/orders/entities/order.entity';
import { OrderItem } from '../../modules/orders/entities/order-item.entity';
import { Payment } from '../../modules/payments/entities/payment.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Divya@15',
  database: process.env.DB_DATABASE || 'crochet_db',
  entities: [
    Admin,
    Customer,
    Category,
    Tag,
    Product,
    ProductImage,
    Cart,
    CartItem,
    Address,
    Order,
    OrderItem,
    Payment,
  ],
  synchronize: true,
});

async function clearProducts() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  console.log('Clearing old product catalog data...');
  try {
    await queryRunner.query('DELETE FROM cart_items;');
    await queryRunner.query('DELETE FROM order_items;');
    await queryRunner.query('DELETE FROM payments;');
    await queryRunner.query('DELETE FROM orders;');
    await queryRunner.query('DELETE FROM product_tags;');
    await queryRunner.query('DELETE FROM product_images;');
    await queryRunner.query('DELETE FROM products;');
    console.log('✨ All product and order tables cleaned successfully!');
    console.log('👑 Admin accounts, Categories, and Tag Master tags are preserved for clean manual entry.');
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

clearProducts();
