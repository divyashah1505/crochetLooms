import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Category } from '../../modules/categories/entities/category.entity';
import { Tag } from '../../modules/tags/entities/tag.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductImage } from '../../modules/products/entities/product-image.entity';
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

const CATEGORY_HIERARCHY = [
  {
    name: 'Bags & Purses',
    slug: 'bags-purses',
    description: 'Handcrafted crochet tote bags, purses, and crossbody slings',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      { name: 'Tote Bags', slug: 'tote-bags', description: 'Spacious everyday granny square and ribbed tote bags' },
      { name: 'Crossbody & Shoulder Bags', slug: 'crossbody-shoulder-bags', description: 'Chic hands-free slings and shoulder bags' },
      { name: 'Clutch & Pouches', slug: 'clutch-pouches', description: 'Mini coin purses, cosmetic pouches, and clutches' },
    ],
  },
  {
    name: 'Wearables & Clothing',
    slug: 'wearables-clothing',
    description: 'Handmade knitwear, bohemian tops, cardigans, and cozy beanies',
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      { name: 'Cardigans & Sweaters', slug: 'cardigans-sweaters', description: 'Artisanal heirloom granny square cardigans' },
      { name: 'Tops & Skirt Sets', slug: 'tops-skirt-sets', description: 'Custom fitted cropped tops and matching skirts' },
      { name: 'Hats, Beanies & Scarves', slug: 'hats-beanies-scarves', description: 'Warm bucket hats, winter beanies, and scarves' },
    ],
  },
  {
    name: 'Amigurumi & Plushies',
    slug: 'amigurumi-plushies',
    description: 'Adorable handcrafted stuffed plushies, animals, and heritage keepsakes',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      { name: 'Animal Plushies', slug: 'animal-plushies', description: 'Cute bunnies, penguins, teddy bears, and kitties' },
      { name: 'Devotional & Heritage Idols', slug: 'devotional-heritage-idols', description: 'Sacred handmade Ganpati Bappa and deity idols' },
      { name: 'Character Miniatures', slug: 'character-miniatures', description: 'Miniature collectible plushie figures' },
    ],
  },
  {
    name: 'Botanical & Flowers',
    slug: 'botanical-flowers',
    description: 'Everlasting knitted flower bouquets, roses, and sunflowers',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      { name: 'Handmade Bouquets', slug: 'handmade-bouquets', description: 'Arranged floral bouquets wrapped with ribbons' },
      { name: 'Single Blossom Stems', slug: 'single-blossom-stems', description: 'Individual roses, sunflowers, tulips, and daisies' },
      { name: 'Potted Plant Decor', slug: 'potted-plant-decor', description: 'Mini knitted succulents and potted desk flowers' },
    ],
  },
  {
    name: 'Home Decor & Living',
    slug: 'home-decor-living',
    description: 'Cozy artisanal home accents, waffle blankets, and coasters',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      { name: 'Mug Coasters & Placemats', slug: 'mug-coasters-placemats', description: 'Floral and bohemian tea & coffee mug coasters' },
      { name: 'Throws & Blankets', slug: 'throws-blankets', description: 'Heirloom waffle stitch and pastel throw blankets' },
      { name: 'Wall Hangings & Baskets', slug: 'wall-hangings-baskets', description: 'Boho tapestry wall hangings and storage baskets' },
    ],
  },
  {
    name: 'Accessories & Keychains',
    slug: 'accessories-keychains',
    description: 'Miniature charms, hair accessories, scrunchies, and keychains',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    subcategories: [
      { name: 'Hair Scrunchies & Clips', slug: 'hair-scrunchies-clips', description: 'Pastel flower scrunchies and hairpins' },
      { name: 'Keychains & Bag Charms', slug: 'keychains-bag-charms', description: 'Damru, flower, and animal charm keychains' },
      { name: 'Car Mirror Hangings', slug: 'car-mirror-hangings', description: 'Cute potted plant and floral car mirror charms' },
    ],
  },
];

async function seedCategoryHierarchy() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();

  const categoryRepo = AppDataSource.getRepository(Category);

  for (const parentData of CATEGORY_HIERARCHY) {
    let parent = await categoryRepo.findOne({ where: { slug: parentData.slug } });
    if (!parent) {
      parent = categoryRepo.create({
        name: parentData.name,
        slug: parentData.slug,
        description: parentData.description,
        imageUrl: parentData.imageUrl,
        parentId: null,
      });
      parent = await categoryRepo.save(parent);
      console.log(`📁 Created Parent Category: "${parent.name}"`);
    } else {
      parent.name = parentData.name;
      parent.description = parentData.description;
      parent.imageUrl = parentData.imageUrl;
      parent.parentId = null;
      parent = await categoryRepo.save(parent);
      console.log(`ℹ️ Updated Parent Category: "${parent.name}"`);
    }

    // Seed Subcategories
    for (const sub of parentData.subcategories) {
      let subcat = await categoryRepo.findOne({ where: { slug: sub.slug } });
      if (!subcat) {
        subcat = categoryRepo.create({
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          parentId: parent.id,
        });
        await categoryRepo.save(subcat);
        console.log(`  └─ 🏷️ Created Subcategory: "${subcat.name}" under [${parent.name}]`);
      } else {
        subcat.name = sub.name;
        subcat.description = sub.description;
        subcat.parentId = parent.id;
        await categoryRepo.save(subcat);
        console.log(`  └─ ℹ️ Updated Subcategory: "${subcat.name}" under [${parent.name}]`);
      }
    }
  }

  console.log('🎉 Category and Subcategory hierarchy seeded successfully!');
  await AppDataSource.destroy();
}

seedCategoryHierarchy().catch((err) => {
  console.error('Error seeding category hierarchy:', err);
  process.exit(1);
});
