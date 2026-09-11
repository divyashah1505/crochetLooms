const { Client } = require('pg');

const localUrl = 'postgresql://postgres:Divya%4015@localhost:5432/crochet_db';
const liveUrl = 'postgresql://crochet_db_5tnm_user:M5p65NDUioQzh0AkaoXGzVfSgcB0CPor@dpg-dagfrt8u01pc73fmm4r0-a.oregon-postgres.render.com/crochet_db_5tnm?ssl=true';

const productId = 'b1111111-1111-4111-8111-111111111111';
const imageId = 'c1111111-1111-4111-8111-111111111111';
const categoryId = '371bdf22-7c82-4f26-bc0e-0e0f50fd2b19'; // Amigurumi & Plushies

const product = {
  id: productId,
  name: 'Mini Daisy Charm (Razorpay ₹11 Test)',
  slug: 'mini-daisy-charm-11-test',
  description: 'Handcrafted miniature crochet daisy charm. Perfect for testing payments and quick checkout with Razorpay.',
  price: 11.00,
  compareAtPrice: 49.00,
  stock: 999,
  category_id: categoryId,
  is_active: true,
  is_featured: true,
  materials: '100% Organic Cotton Yarn, Silver Keyring',
  dimensions: '4cm x 4cm',
  care_instructions: 'Spot clean with damp cloth',
  crafting_time: '30 mins',
  weight: '15g',
  sku: 'RZP-TEST-11',
  now: new Date(),
};

const imageUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';

async function addProductToDb(connectionString, label) {
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('render.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log(`🔌 Connected to ${label}`);

    // Insert or update product
    await client.query(
      `INSERT INTO products (
        id, name, slug, description, price, "compareAtPrice", stock,
        category_id, is_active, is_featured, materials, dimensions,
        care_instructions, crafting_time, weight, sku, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        "compareAtPrice" = EXCLUDED."compareAtPrice",
        stock = EXCLUDED.stock,
        is_active = EXCLUDED.is_active,
        is_featured = EXCLUDED.is_featured,
        updated_at = EXCLUDED.updated_at`,
      [
        product.id,
        product.name,
        product.slug,
        product.description,
        product.price,
        product.compareAtPrice,
        product.stock,
        product.category_id,
        product.is_active,
        product.is_featured,
        product.materials,
        product.dimensions,
        product.care_instructions,
        product.crafting_time,
        product.weight,
        product.sku,
        product.now,
        product.now,
      ]
    );

    // Insert image
    await client.query(
      `INSERT INTO product_images (id, product_id, image_url, public_id, display_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url`,
      [imageId, productId, imageUrl, 'sample_test_11', 0, product.now]
    );

    console.log(`✅ Successfully added ₹11 test product to ${label}!`);
  } catch (err) {
    console.error(`❌ Error adding to ${label}:`, err.message);
  } finally {
    await client.end();
  }
}

async function main() {
  await addProductToDb(localUrl, 'Local Database (crochet_db)');
  await addProductToDb(liveUrl, 'Live Render Database (crochet_db_5tnm)');
}

main();
