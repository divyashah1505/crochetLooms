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

async function addInstagramProducts() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  const productRepo = AppDataSource.getRepository(Product);
  const imageRepo = AppDataSource.getRepository(ProductImage);
  const categoryRepo = AppDataSource.getRepository(Category);
  const tagRepo = AppDataSource.getRepository(Tag);

  // Fetch or create categories
  const categories = await categoryRepo.find();
  const catMap = new Map<string, Category>();
  categories.forEach((c) => catMap.set(c.slug, c));

  // Fetch tags
  const allTags = await tagRepo.find();
  const tagMap = new Map<string, Tag>();
  allTags.forEach((t) => tagMap.set(t.slug, t));

  const instagramPosts = [
    {
      name: 'Coffee Brown Handcrafted Crochet Top & Skirt Set',
      slug: 'coffee-brown-crochet-top-skirt-set',
      description:
        'Crochet, coffee tones & a little main character energy 🤎☕✨ Handcrafted custom two-piece set featuring delicate scallop borders and breathable organic cotton yarn. Designed for supreme comfort and effortless aesthetic style. (From @crochet_diya1227)',
      price: 1499.0,
      compareAtPrice: 1899.0,
      stock: 6,
      categorySlug: 'wearables-cardigans',
      tagSlugs: ['cardigan', 'pastel'],
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Cute Amigurumi Penguin Keychain & Bag Charm 🐧',
      slug: 'cute-amigurumi-penguin-keychain',
      description:
        'Order completed & delivered 🐧💗 Handmade with soft velvety yarn, embroidered pink cheeks, and reinforced keyring clasp. Perfect as a bag charm, backpack accessory, or gift! (From @crochet_diya1227)',
      price: 299.0,
      compareAtPrice: 399.0,
      stock: 25,
      categorySlug: 'accessories-keychains',
      tagSlugs: ['keychain', 'amigurumi', 'pastel'],
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Handcrafted Crochet Hair Accessories & Flower Keychain Set 🌸',
      slug: 'crochet-hair-accessories-flower-keychain-set',
      description:
        'Orders shipped & more cuteness on the way! 📦✨ Includes artisanal crochet floral scrunchies, delicate hairpins, and a flower bag charm keychain crafted with vibrant pastel tones. (From @crochet_diya1227)',
      price: 349.0,
      compareAtPrice: 449.0,
      stock: 18,
      categorySlug: 'accessories-keychains',
      tagSlugs: ['flower', 'keychain', 'pastel'],
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Handmade Crochet Damru Devotional Keychain 🔱',
      slug: 'handmade-crochet-damru-keychain',
      description:
        'POV: Your keychain just got a Mahadev makeover 🔱🤎✨ Miniature handcrafted brown and white crochet Damru with fine beadwork and sturdy clasp. (From @crochet_diya1227)',
      price: 249.0,
      compareAtPrice: 349.0,
      stock: 30,
      categorySlug: 'accessories-keychains',
      tagSlugs: ['keychain'],
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Handmade Crochet Ganpati Bappa Amigurumi Idol 🪷',
      slug: 'crochet-ganpati-bappa-amigurumi-idol',
      description:
        'Crochet Ganpati Bappa 🪷🙏 Bring home the divine blessings of Ganpati Bappa. Hand-knitted with sacred golden and saffron threads on an auspicious lotus base. (From @crochet_diya1227)',
      price: 499.0,
      compareAtPrice: 699.0,
      stock: 15,
      categorySlug: 'home-decor-living',
      tagSlugs: ['amigurumi', 'flower', 'pastel'],
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Pastel Flower & Cat Paw Crochet Keychain Collection ✨',
      slug: 'pastel-flower-cat-paw-keychain-collection',
      description:
        '✨ Crochet Keychain Collection ✨ Cute • Handmade • Unique. Hand-stitched with love in assorted botanical blossoms and playful cat paw designs. Perfect gifts for loved ones! (From @crochet_diya1227)',
      price: 199.0,
      compareAtPrice: 299.0,
      stock: 40,
      categorySlug: 'accessories-keychains',
      tagSlugs: ['flower', 'keychain', 'pastel'],
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
      ],
    },
  ];

  for (const item of instagramPosts) {
    let product = await productRepo.findOne({ where: { slug: item.slug } });
    const category = catMap.get(item.categorySlug) || Array.from(catMap.values())[0];
    const tags = item.tagSlugs.map((s) => tagMap.get(s)).filter(Boolean) as Tag[];

    if (!product) {
      product = productRepo.create({
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        stock: item.stock,
        categoryId: category.id,
        isFeatured: item.isFeatured,
        isActive: true,
        tags,
      });
      product = await productRepo.save(product);

      const images = item.images.map((imgUrl, idx) =>
        imageRepo.create({
          productId: product.id,
          imageUrl: imgUrl,
          displayOrder: idx,
        }),
      );
      await imageRepo.save(images);
      console.log(`✅ Added Instagram creation: "${product.name}"`);
    } else {
      product.name = item.name;
      product.description = item.description;
      product.price = item.price;
      product.compareAtPrice = item.compareAtPrice;
      product.tags = tags;
      await productRepo.save(product);
      console.log(`ℹ️ Updated Instagram creation: "${product.name}"`);
    }
  }

  console.log('🎉 All Instagram products from @crochet_diya1227 added successfully!');
  await AppDataSource.destroy();
}

addInstagramProducts().catch((err) => {
  console.error('Error adding Instagram products:', err);
  process.exit(1);
});
