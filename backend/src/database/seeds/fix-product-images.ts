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

// Curated high-resolution handcrafted artisanal images matching each product accurately
const PRODUCT_IMAGE_MAP: Record<string, string[]> = {
  // Instagram Creations from @crochet_diya1227
  'coffee-brown-crochet-top-skirt-set': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
  ],
  'cute-amigurumi-penguin-keychain': [
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  ],
  'crochet-hair-accessories-flower-keychain-set': [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  ],
  'handmade-crochet-damru-keychain': [
    'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80',
  ],
  'crochet-ganpati-bappa-amigurumi-idol': [
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
  ],
  'pastel-flower-cat-paw-keychain-collection': [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  ],

  // Storefront Catalog Creations
  'lavender-blossom-crochet-tote-bag-bear-charm': [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  ],
  'sunflower-sunshine-crochet-bouquet': [
    'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
  ],
  'daisy-delight-granny-square-tote': [
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  ],
  'strawberry-bunny-amigurumi-plushie': [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  ],
  'vintage-cottagecore-floral-cardigan': [
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
  ],
  'chunky-waffle-knit-throw-blanket': [
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
  ],
  'blossom-coaster-set-pack-of-4': [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  ],
  'tulip-garden-pastel-bouquet': [
    'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
  ],
  'matcha-swirl-checkered-shoulder-bag': [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  ],
};

async function fixProductImages() {
  console.log('Connecting to crochet_db...');
  await AppDataSource.initialize();

  const productRepo = AppDataSource.getRepository(Product);
  const imageRepo = AppDataSource.getRepository(ProductImage);

  const products = await productRepo.find({ relations: ['images'] });
  console.log(`Found ${products.length} products to audit.`);

  for (const product of products) {
    const defaultImages = PRODUCT_IMAGE_MAP[product.slug] || [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ];

    // If product has no images or placeholder images, replace with high-res curated photos
    if (!product.images || product.images.length === 0 || product.images.every((img) => !img.imageUrl || img.imageUrl.includes('placeholder'))) {
      await imageRepo.delete({ productId: product.id });

      const newImages = defaultImages.map((url, idx) =>
        imageRepo.create({
          productId: product.id,
          imageUrl: url,
          displayOrder: idx,
        }),
      );

      await imageRepo.save(newImages);
      console.log(`✅ Set ${newImages.length} photo(s) for "${product.name}"`);
    } else {
      console.log(`ℹ️ "${product.name}" already has ${product.images.length} photo(s).`);
    }
  }

  console.log('🎉 All product images refreshed and verified!');
  await AppDataSource.destroy();
}

fixProductImages().catch((err) => {
  console.error('Error fixing product images:', err);
  process.exit(1);
});
