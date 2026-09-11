const { Client } = require('pg');
const bcrypt = require('bcrypt');

const localClient = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Divya@15',
  database: 'crochet_db',
});

const liveClient = new Client({
  connectionString: 'postgresql://crochet_db_5tnm_user:M5p65NDUioQzh0AkaoXGzVfSgcB0CPor@dpg-dagfrt8u01pc73fmm4r0-a.oregon-postgres.render.com/crochet_db_5tnm',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log('Connecting to databases...');
  await localClient.connect();
  await liveClient.connect();
  console.log('Connected to both local and live databases.');

  // 1. Sync Admins
  const admins = await localClient.query('SELECT * FROM admins');
  for (const a of admins.rows) {
    await liveClient.query(
      `INSERT INTO admins (id, name, email, password, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [a.id, a.name, a.email, a.password, a.created_at, a.updated_at]
    );
  }
  console.log(`✅ Synced ${admins.rows.length} admin(s).`);

  // 2. Sync Categories (Parents first, then subcategories)
  const categories = await localClient.query('SELECT * FROM categories ORDER BY parent_id NULLS FIRST');
  for (const c of categories.rows) {
    await liveClient.query(
      `INSERT INTO categories (id, name, slug, description, image_url, parent_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [c.id, c.name, c.slug, c.description, c.image_url, c.parent_id, c.created_at, c.updated_at]
    );
  }
  console.log(`✅ Synced ${categories.rows.length} categories.`);

  // 3. Sync Tags
  const tags = await localClient.query('SELECT * FROM tags');
  for (const t of tags.rows) {
    await liveClient.query(
      `INSERT INTO tags (id, name, slug, description, icon, tag_group, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [t.id, t.name, t.slug, t.description, t.icon, t.tag_group, t.created_at, t.updated_at]
    );
  }
  console.log(`✅ Synced ${tags.rows.length} tags.`);

  // 4. Sync Products
  const products = await localClient.query('SELECT * FROM products');
  for (const p of products.rows) {
    await liveClient.query(
      `INSERT INTO products (id, name, slug, description, price, "compareAtPrice", stock, category_id, created_by_admin_id, is_active, is_featured, materials, dimensions, care_instructions, crafting_time, weight, sku, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       ON CONFLICT (id) DO NOTHING`,
      [
        p.id, p.name, p.slug, p.description, p.price, p.compareAtPrice || p.compare_at_price, p.stock,
        p.category_id, p.created_by_admin_id, p.is_active, p.is_featured,
        p.materials, p.dimensions, p.care_instructions, p.crafting_time,
        p.weight, p.sku, p.created_at, p.updated_at
      ]
    );
  }
  console.log(`✅ Synced ${products.rows.length} products.`);

  // 5. Sync Product Images (and point local uploads to live render URL)
  const images = await localClient.query('SELECT * FROM product_images');
  for (const img of images.rows) {
    const liveImageUrl = img.image_url.replace('http://localhost:5000', 'https://crochetlooms.onrender.com');
    await liveClient.query(
      `INSERT INTO product_images (id, product_id, image_url, public_id, display_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [img.id, img.product_id, liveImageUrl, img.public_id, img.display_order, img.created_at]
    );
  }
  console.log(`✅ Synced ${images.rows.length} product images (mapped to https://crochetlooms.onrender.com).`);

  // 6. Sync Product Tags
  const productTags = await localClient.query('SELECT * FROM product_tags');
  for (const pt of productTags.rows) {
    await liveClient.query(
      `INSERT INTO product_tags (product_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [pt.product_id, pt.tag_id]
    );
  }
  console.log(`✅ Synced ${productTags.rows.length} product-tag links.`);

  await localClient.end();
  await liveClient.end();
  console.log('🎉 Live Render database sync complete!');
}

run().catch(console.error);
