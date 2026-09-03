import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Tag } from '../../modules/tags/entities/tag.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductImage } from '../../modules/products/entities/product-image.entity';
import { Category } from '../../modules/categories/entities/category.entity';
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

const MASTER_TAG_TAXONOMY = [
  // 1. Product Type
  { name: 'Bags & Purses', slug: 'bags', icon: '👜', group: 'Product Type', description: 'Artisanal crochet tote bags, purses, and crossbody slings' },
  { name: 'Keychains & Charms', slug: 'keychains', icon: '✨', group: 'Product Type', description: 'Miniature knitted charm keychains and backpack accessories' },
  { name: 'Flowers & Bouquets', slug: 'flowers', icon: '🌸', group: 'Product Type', description: 'Everlasting knitted botanical blossoms, roses, and sunflowers' },
  { name: 'Toys & Plushies', slug: 'toys', icon: '🧸', group: 'Product Type', description: 'Handcrafted cuddly amigurumi animals and characters' },
  { name: 'Clothing & Wearables', slug: 'clothing', icon: '🧶', group: 'Product Type', description: 'Hand-crocheted cardigans, sweaters, crop tops, and scarves' },

  // 2. Occasion
  { name: 'Birthday', slug: 'birthday', icon: '🎂', group: 'Occasion', description: 'Thoughtful handmade birthday gifts and customized keepsakes' },
  { name: 'Anniversary', slug: 'anniversary', icon: '💍', group: 'Occasion', description: 'Romantic eternal bouquets and matching couple accessories' },
  { name: 'Baby Shower', slug: 'baby-shower', icon: '🍼', group: 'Occasion', description: 'Gentle organic baby booties, rattles, and nursery plushies' },
  { name: "Valentine's Day", slug: 'valentines-day', icon: '💖', group: 'Occasion', description: 'Heartfelt red roses, heart keychains, and romantic gifts' },

  // 3. Style
  { name: 'Cute', slug: 'cute', icon: '🥰', group: 'Style', description: 'Playful, sweet, and adorable pastel creations' },
  { name: 'Minimalist', slug: 'minimalist', icon: '🤍', group: 'Style', description: 'Understated elegant tones and clean geometric lines' },
  { name: 'Aesthetic', slug: 'aesthetic', icon: '🎨', group: 'Style', description: 'Cottagecore, vintage, and modern aesthetic knits' },
  { name: 'Traditional', slug: 'traditional', icon: '🪷', group: 'Style', description: 'Heirloom devotional idols and traditional floral crafts' },
  { name: 'Modern', slug: 'modern', icon: '⚡', group: 'Style', description: 'Contemporary checkered patterns and trendy street style pieces' },

  // 4. Recipient
  { name: 'Women', slug: 'women', icon: '👩', group: 'Recipient', description: 'Handmade bags, floral accessories, and wearables for women' },
  { name: 'Men', slug: 'men', icon: '👨', group: 'Recipient', description: 'Cozy beanies, keychains, and neutral home decor for men' },
  { name: 'Kids', slug: 'kids', icon: '👧', group: 'Recipient', description: 'Fun toys, cute character charms, and playful accessories' },
  { name: 'Babies', slug: 'babies', icon: '👶', group: 'Recipient', description: 'Hypoallergenic soft yarn booties and nursery decor' },
  { name: 'Couples', slug: 'couples', icon: '💑', group: 'Recipient', description: 'Matching pair keychains and celebratory decor' },

  // 5. Special Features
  { name: '100% Handmade', slug: 'handmade', icon: '🧶', group: 'Special Features', description: 'Every single stitch hand-knitted by master artisans' },
  { name: 'Customizable', slug: 'customizable', icon: '✨', group: 'Special Features', description: 'Custom color choices, sizes, and personalized initial charms' },
  { name: 'Eco-Friendly', slug: 'eco-friendly', icon: '🌿', group: 'Special Features', description: 'Organic natural cotton yarn and plastic-free packaging' },
  { name: 'Premium Yarn', slug: 'premium-yarn', icon: '🧵', group: 'Special Features', description: 'Ultra-soft velvety milk cotton and premium wool' },
];

async function seedMasterTags() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  const tagRepo = AppDataSource.getRepository(Tag);

  for (const item of MASTER_TAG_TAXONOMY) {
    let existing = await tagRepo.findOne({ where: [{ slug: item.slug }, { name: item.name }] });
    if (!existing) {
      existing = tagRepo.create(item);
      await tagRepo.save(existing);
      console.log(`✅ Created [${item.group}] tag: ${item.icon} ${item.name}`);
    } else {
      existing.icon = item.icon;
      existing.group = item.group;
      existing.description = item.description;
      await tagRepo.save(existing);
      console.log(`ℹ️ Updated [${item.group}] tag: ${item.icon} ${item.name}`);
    }
  }

  console.log('🎉 All 5 Master Tag Groups & 23 Taxonomy Tags seeded successfully!');
  await AppDataSource.destroy();
}

seedMasterTags().catch((err) => {
  console.error('Error seeding master tags:', err);
  process.exit(1);
});
