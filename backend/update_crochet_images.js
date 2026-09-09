const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const url = new URL(`${API_BASE}${path}`);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Map each product slug to dedicated, authentic crochet handmade images
const productImagesMap = {
  // 1. Accessories & Keychains
  'mini-sunburst-daisy-crochet-charm-keychain': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_sunflower_keychain_1788931644167.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_hair_clip_1788931726288.jpg', displayOrder: 1 },
  ],
  'pastel-botanical-hanging-succulent-car-mirror-charm': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_hanging_plant_1788931671636.jpg', displayOrder: 0 },
  ],
  'fluffy-daisy-pastel-crochet-scrunchie-set': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_hair_scrunchie_1788931708412.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_hair_accessories_1788427096752.jpg', displayOrder: 1 },
  ],
  'artisan-boba-bubble-milk-tea-bag-charm': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_boba_charm_1788931688224.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_sunflower_keychain_1788931644167.jpg', displayOrder: 1 },
  ],
  'retro-cottagecore-daisy-crochet-hair-clip-pin-duo': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_hair_clip_1788931726288.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_hair_accessories_1788427096752.jpg', displayOrder: 1 },
  ],

  // 2. Amigurumi & Plushies
  'chubby-velvet-bunny-plushie-in-strawberry-pinafore': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_bunny_plushie_1788931885868.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_whale_plushie_1788931924773.jpg', displayOrder: 1 },
  ],
  'handmade-devotional-crochet-ganpati-bappa-idol': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_ganpati_bappa_1788427070136.jpg', displayOrder: 0 },
  ],
  'sleepy-bear-teddy-plushie-in-oatmeal-overalls': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_teddy_bear_1788931906221.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_bunny_plushie_1788931885868.jpg', displayOrder: 1 },
  ],
  'kawaii-ocean-whale-amigurumi-plush-trio': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_whale_plushie_1788931924773.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_bunny_plushie_1788931885868.jpg', displayOrder: 1 },
  ],
  'artisan-woodland-rust-fox-stuffed-animal': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_fox_plushie_1788931945274.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_teddy_bear_1788931906221.jpg', displayOrder: 1 },
  ],

  // 3. Bags & Purses
  'sunburst-daisy-motif-bohemian-shoulder-bag': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_daisy_bag_1788931964588.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_master_bags_1788428531823.jpg', displayOrder: 1 },
  ],
  'vintage-pastel-granny-square-french-market-tote': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_market_tote_1788931985179.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_daisy_bag_1788931964588.jpg', displayOrder: 1 },
  ],
  'pearl-beaded-handle-tulip-crossbody-clutch-pouch': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_tulip_clutch_1788932009894.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_master_bags_1788428531823.jpg', displayOrder: 1 },
  ],
  'textured-ribbed-everyday-canvas-lined-handbag': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_ribbed_handbag_1788932032515.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_daisy_bag_1788931964588.jpg', displayOrder: 1 },
  ],
  'bohemian-fringe-crochet-envelope-clutch-with-wooden-clasp': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_master_bags_1788428531823.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_tulip_clutch_1788932009894.jpg', displayOrder: 1 },
  ],

  // 4. Botanical & Flowers
  'everlasting-crimson-rose-babys-breath-bouquet': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_master_flowers_1788428559503.jpg', displayOrder: 0 },
    { imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
  ],
  'pastel-lavender-chamomile-meadow-flower-bunch': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_master_flowers_1788428559503.jpg', displayOrder: 0 },
  ],
  'blooming-sunflower-in-terracotta-pot-desk-accent': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_sunflower_keychain_1788931644167.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_hanging_plant_1788931671636.jpg', displayOrder: 1 },
  ],
  'trio-of-french-velvet-tulip-crochet-stems': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_tulip_clutch_1788932009894.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_master_flowers_1788428559503.jpg', displayOrder: 1 },
  ],
  'cascading-potted-string-of-pearls-hanging-crochet-succulent': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_hanging_plant_1788931671636.jpg', displayOrder: 0 },
  ],

  // 5. Home Decor & Living
  'heirloom-waffle-stitch-pastel-cotton-throw-blanket': [
    { imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
  ],
  'handmade-botanical-daisy-drink-coasters-set-of-4': [
    { imageUrl: 'http://localhost:5000/uploads/crochet_hair_scrunchie_1788931708412.jpg', displayOrder: 0 },
    { imageUrl: 'http://localhost:5000/uploads/crochet_sunflower_keychain_1788931644167.jpg', displayOrder: 1 },
  ],
  'boho-mandala-tapestry-crochet-wall-hanging': [
    { imageUrl: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
  ],
  'cotton-rope-and-crochet-nesting-storage-baskets-set-of-2': [
    { imageUrl: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
  ],
  'sunburst-floral-table-runner-in-natural-oatmeal-linen': [
    { imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
  ],

  // 6. Wearables & Clothing
  'vintage-blossom-pastel-granny-square-cardigan': [
    { imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
  ],
  'bohemian-ripple-wave-halter-crochet-crop-top': [
    { imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
  ],
  'retro-daisy-patchwork-reversible-bucket-hat': [
    { imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
  ],
  'cozy-ribbed-slouchy-beanie-with-fold-up-brim': [
    { imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
  ],
  'artisan-chunky-knit-bell-sleeve-pullover-sweater': [
    { imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
  ],
};

async function main() {
  console.log('🔑 Logging in as Admin...');
  const login = await request('POST', '/admin/auth/login', {
    email: 'admin@crochet.com',
    password: 'Admin@123',
  });
  const token = login.data?.data?.accessToken;
  if (!token) {
    console.error('❌ Login failed');
    process.exit(1);
  }

  console.log('📦 Fetching all products from API...');
  const prodsRes = await request('GET', '/products?limit=100');
  const products = prodsRes.data?.data?.items || [];
  console.log(`Found ${products.length} products to check and update.`);

  let updated = 0;
  for (const prod of products) {
    const newImages = productImagesMap[prod.slug];
    if (newImages) {
      console.log(`Updating images for: "${prod.name}" (${prod.slug})...`);
      const updateRes = await request(
        'PUT',
        `/products/${prod.id}`,
        { images: newImages },
        token,
      );
      if (updateRes.status === 200) {
        updated++;
        console.log(`✅ Successfully updated images for "${prod.name}"`);
      } else {
        console.warn(`⚠️ Update failed for "${prod.name}":`, updateRes.data);
      }
    }
  }

  console.log(`\n🎉 Completed! Updated images for ${updated} products.`);
}

main().catch(console.error);
