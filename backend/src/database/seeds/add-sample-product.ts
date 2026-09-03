import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Admin } from '../../modules/admins/entities/admin.entity';
import { Customer } from '../../modules/customers/entities/customer.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Tag } from '../../modules/tags/entities/tag.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductImage } from '../../modules/products/entities/product-image.entity';
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

async function addCustomProduct() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  const productRepo = AppDataSource.getRepository(Product);
  const imageRepo = AppDataSource.getRepository(ProductImage);
  const categoryRepo = AppDataSource.getRepository(Category);
  const tagRepo = AppDataSource.getRepository(Tag);

  // 1. Get category
  let category = await categoryRepo.findOne({ where: { slug: 'bags-purses' } });
  if (!category) {
    category = categoryRepo.create({
      name: 'Bags & Purses',
      slug: 'bags-purses',
      description: 'Chic bohemian crochet tote bags and flower purses.',
    });
    category = await categoryRepo.save(category);
  }

  // 2. Get tags
  const flowerTag = await tagRepo.findOne({ where: { slug: 'flower' } });
  const purseTag = await tagRepo.findOne({ where: { slug: 'purse' } });
  const pastelTag = await tagRepo.findOne({ where: { slug: 'pastel' } });
  const amigurumiTag = await tagRepo.findOne({ where: { slug: 'amigurumi' } });

  const tags = [flowerTag, purseTag, pastelTag, amigurumiTag].filter(Boolean) as Tag[];

  // 3. Create or update sample product
  const slug = 'lavender-blossom-crochet-tote-bag-plushie-charm';
  let product = await productRepo.findOne({ where: { slug } });

  if (product) {
    console.log(`ℹ️ Product "${product.name}" already exists.`);
  } else {
    product = productRepo.create({
      name: 'Lavender Blossom Crochet Tote Bag & Bear Charm Set',
      slug,
      description:
        '✨ Artisan Highlight: Hand-stitched with ultra-soft organic cotton and pastel lavender yarn. Features reinforced lattice handles, 3D raised cherry blossom petals, and includes a detachable handcrafted miniature teddy bear charm! Perfect for carrying books, tablets, everyday treasures, or gifting to someone special.',
      price: 1899.0,
      compareAtPrice: 2499.0,
      stock: 10,
      isActive: true,
      isFeatured: true,
      category,
      tags,
    });
    product = await productRepo.save(product);

    // Images
    const img1 = imageRepo.create({
      productId: product.id,
      imageUrl:
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
      displayOrder: 0,
    });
    const img2 = imageRepo.create({
      productId: product.id,
      imageUrl:
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80',
      displayOrder: 1,
    });
    const img3 = imageRepo.create({
      productId: product.id,
      imageUrl:
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80',
      displayOrder: 2,
    });

    await imageRepo.save([img1, img2, img3]);
    console.log(`✅ Successfully added sample product: "${product.name}" with 3 images & 4 tags!`);
  }

  await AppDataSource.destroy();
}

addCustomProduct().catch((err) => {
  console.error('Error adding product:', err);
  process.exit(1);
});
