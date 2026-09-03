import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
  password: process.env.DB_PASSWORD || 'postgres',
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

async function runSeed() {
  console.log('🌱 Initializing Database Connection...');
  await AppDataSource.initialize();
  console.log('✅ Connected to database.');

  const adminRepo = AppDataSource.getRepository(Admin);
  const customerRepo = AppDataSource.getRepository(Customer);
  const categoryRepo = AppDataSource.getRepository(Category);
  const tagRepo = AppDataSource.getRepository(Tag);
  const productRepo = AppDataSource.getRepository(Product);
  const imageRepo = AppDataSource.getRepository(ProductImage);
  const cartRepo = AppDataSource.getRepository(Cart);
  const addressRepo = AppDataSource.getRepository(Address);

  // 1. Seed Admin
  let admin = await adminRepo.findOne({ where: { email: 'admin@crochet.com' } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    admin = adminRepo.create({
      name: 'Artisan Head Admin',
      email: 'admin@crochet.com',
      password: hashedPassword,
    });
    admin = await adminRepo.save(admin);
    console.log('👤 Admin seeded: admin@crochet.com / Admin@123');
  }

  // 2. Seed Customer
  let customer = await customerRepo.findOne({ where: { email: 'customer@crochet.com' } });
  if (!customer) {
    const hashedPassword = await bcrypt.hash('Customer@123', 10);
    customer = customerRepo.create({
      name: 'Emma Watson',
      email: 'customer@crochet.com',
      password: hashedPassword,
      phone: '+91 9876543210',
    });
    customer = await customerRepo.save(customer);

    const cart = cartRepo.create({ customerId: customer.id });
    await cartRepo.save(cart);

    const address = addressRepo.create({
      customerId: customer.id,
      fullName: 'Emma Watson',
      phone: '+91 9876543210',
      addressLine1: '42 Baker Street, Sunshine Colony',
      addressLine2: 'Apt 302, Flora Gardens',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      isDefault: true,
    });
    await addressRepo.save(address);

    console.log('👩 Customer seeded: customer@crochet.com / Customer@123');
  }

  // 3. Seed Categories
  const categoriesData = [
    {
      name: 'Amigurumi & Plushies',
      slug: 'amigurumi-plushies',
      description: 'Handcrafted cute miniature crochet plush animals, dolls, and whimsical creatures made with 100% organic cotton yarn.',
      imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Bags & Purses',
      slug: 'bags-purses',
      description: 'Chic bohemian crochet tote bags, flower crossbody clutches, and aesthetic granny-square handbags.',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Wearables & Cardigans',
      slug: 'wearables-cardigans',
      description: 'Breathable crochet sweaters, vintage daisy tops, cozy bucket hats, and floral cardigans.',
      imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Home Decor & Living',
      slug: 'home-decor-living',
      description: 'Textured handmade coasters, floral table runners, soft throw blankets, and wall hangings.',
      imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Accessories & Keychains',
      slug: 'accessories-keychains',
      description: 'Miniature flower bouquet keychains, scrunchies, bookmarks, and bespoke trinkets.',
      imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const categoryMap = new Map<string, Category>();
  for (const catData of categoriesData) {
    let cat = await categoryRepo.findOne({ where: { slug: catData.slug } });
    if (!cat) {
      cat = categoryRepo.create(catData);
      cat = await categoryRepo.save(cat);
    }
    categoryMap.set(cat.slug, cat);
  }
  console.log(`📂 ${categoryMap.size} Categories seeded.`);

  // 4. Seed Tags (Tag Master)
  const tagsData = [
    { name: 'Flower', slug: 'flower', description: 'Featuring botanical flower motifs and daisy stitches', icon: '🌸' },
    { name: 'Purse', slug: 'purse', description: 'Handcrafted bags, tote bags, and crossbody purses', icon: '👜' },
    { name: 'Amigurumi', slug: 'amigurumi', description: 'Lovingly stuffed miniature creatures and dolls', icon: '🧸' },
    { name: 'Cardigan', slug: 'cardigan', description: 'Cozy artisanal knitwear and granny-square cardigans', icon: '🧶' },
    { name: 'Keychain', slug: 'keychain', description: 'Compact crochet charm keyrings for bags and keys', icon: '✨' },
    { name: 'Blanket', slug: 'blanket', description: 'Warm heirloom blankets and textured throws', icon: '🛋️' },
    { name: 'Coaster', slug: 'coaster', description: 'Absorbent aesthetic tabletop mug coasters', icon: '☕' },
    { name: 'Pastel', slug: 'pastel', description: 'Soft soothing pastel palette creations', icon: '🎨' },
  ];

  const tagMap = new Map<string, Tag>();
  for (const tData of tagsData) {
    let tag = await tagRepo.findOne({ where: { slug: tData.slug } });
    if (!tag) {
      tag = tagRepo.create(tData);
      tag = await tagRepo.save(tag);
    }
    tagMap.set(tag.slug, tag);
  }
  console.log(`🏷️ ${tagMap.size} Tags seeded into Tag Master.`);

  // 5. Seed Products
  const productsData = [
    {
      name: 'Sunburst Daisy Crochet Shoulder Purse',
      slug: 'sunburst-daisy-crochet-shoulder-purse',
      description: 'Meticulously hand-crocheted shoulder bag adorned with vibrant sunburst daisy motifs. Reinforced with breathable organic cotton lining and sturdy braided strap. Perfect for summer outings and bohemian festivals.',
      price: 1499.00,
      compareAtPrice: 1899.00,
      stock: 15,
      categorySlug: 'bags-purses',
      tagSlugs: ['flower', 'purse', 'pastel'],
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Eternal Rose Crochet Bouquet in Ceramic Pot',
      slug: 'eternal-rose-crochet-bouquet',
      description: 'An everlasting handmade crochet rose and tulip flower bouquet that never withers. Hand-spun with velvet soft yarn, wire stems for adjustable posing, and scented with mild lavender essence.',
      price: 1199.00,
      compareAtPrice: 1499.00,
      stock: 25,
      categorySlug: 'home-decor-living',
      tagSlugs: ['flower', 'home-decor', 'pastel'],
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Vintage Blossom Granny Square Cardigan',
      slug: 'vintage-blossom-granny-square-cardigan',
      description: 'Iconic oversized granny square crochet cardigan featuring pastel floral patches. Designed for supreme comfort with ribbed cuffs and wooden toggles. Handcrafted over 40 hours of artisanal stitching.',
      price: 3499.00,
      compareAtPrice: 4299.00,
      stock: 8,
      categorySlug: 'wearables-cardigans',
      tagSlugs: ['cardigan', 'flower', 'pastel'],
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Chubby Bunny Plushie Amigurumi',
      slug: 'chubby-bunny-plushie-amigurumi',
      description: 'Ultra-plush handcrafted bunny amigurumi with safety eyes and floppy ears. Filled with hypoallergenic fiberfill and dressed in a miniature removable pastel strawberry dress.',
      price: 899.00,
      compareAtPrice: 1199.00,
      stock: 20,
      categorySlug: 'amigurumi-plushies',
      tagSlugs: ['amigurumi', 'pastel'],
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Retro Tulip Crossbody Mini Purse',
      slug: 'retro-tulip-crossbody-mini-purse',
      description: 'Adorable compact crossbody bag featuring a 3D tulip bloom clasp and pearl chain accent. Ideal for holding phones, lip balm, and daily essentials with artisanal flair.',
      price: 1299.00,
      compareAtPrice: 1599.00,
      stock: 12,
      categorySlug: 'bags-purses',
      tagSlugs: ['flower', 'purse', 'pastel'],
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Sunflower Charm Crochet Keychain',
      slug: 'sunflower-charm-crochet-keychain',
      description: 'Bright cheerful mini sunflower keychain with gold lobster clasp. Great as a backpack ornament, purse charm, or thoughtful stocking stuffer.',
      price: 299.00,
      compareAtPrice: 399.00,
      stock: 50,
      categorySlug: 'accessories-keychains',
      tagSlugs: ['flower', 'keychain'],
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Heirloom Waffle Stitch Pastel Throw Blanket',
      slug: 'heirloom-waffle-stitch-pastel-throw-blanket',
      description: 'Sumptuously soft, heavy waffle weave blanket in muted oatmeal and sage hues. Keeps you warm while adding cozy texture to any sofa or bedroom.',
      price: 4299.00,
      compareAtPrice: 5199.00,
      stock: 6,
      categorySlug: 'home-decor-living',
      tagSlugs: ['blanket', 'pastel'],
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Set of 4 Floral Daisy Mug Coasters',
      slug: 'set-of-4-floral-daisy-mug-coasters',
      description: 'Protect surfaces in style with this quartet of handmade daisy drink coasters. Thick double-knit construction absorbs condensation effortlessly.',
      price: 499.00,
      compareAtPrice: 699.00,
      stock: 30,
      categorySlug: 'home-decor-living',
      tagSlugs: ['flower', 'coaster', 'pastel'],
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      ],
    },
  ];

  for (const pData of productsData) {
    let product = await productRepo.findOne({ where: { slug: pData.slug } });
    const category = categoryMap.get(pData.categorySlug);
    const tags = pData.tagSlugs.map((s) => tagMap.get(s)).filter(Boolean);

    if (!product && category) {
      product = productRepo.create({
        name: pData.name,
        slug: pData.slug,
        description: pData.description,
        price: pData.price,
        compareAtPrice: pData.compareAtPrice,
        stock: pData.stock,
        categoryId: category.id,
        createdByAdminId: admin.id,
        isFeatured: pData.isFeatured,
        isActive: true,
        tags,
      });

      const saved = await productRepo.save(product);

      const images = pData.images.map((url, idx) =>
        imageRepo.create({
          productId: saved.id,
          imageUrl: url,
          displayOrder: idx,
        }),
      );
      await imageRepo.save(images);
    }
  }

  console.log(`🧶 ${productsData.length} Products successfully seeded with images and tags.`);
  console.log('🎉 Seeding completed successfully!');
  await AppDataSource.destroy();
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
