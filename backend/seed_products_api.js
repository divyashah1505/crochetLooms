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

async function main() {
  console.log('🔑 Logging into Admin API...');
  const loginRes = await request('POST', '/admin/auth/login', {
    email: 'admin@crochet.com',
    password: 'Admin@123',
  });

  if (loginRes.status !== 200 || !loginRes.data?.data?.accessToken) {
    console.error('❌ Failed to login as admin:', loginRes);
    process.exit(1);
  }

  const token = loginRes.data.data.accessToken;
  console.log('✅ Admin authenticated successfully.');

  // Fetch Categories
  console.log('📂 Fetching Categories...');
  const catRes = await request('GET', '/categories');
  const categories = catRes.data?.data || [];
  const catBySlug = {};
  categories.forEach((c) => {
    catBySlug[c.slug] = c.id;
  });

  // Fetch Tags
  console.log('🏷️ Fetching Tags...');
  const tagRes = await request('GET', '/tags');
  const tags = tagRes.data?.data || [];
  const tagBySlug = {};
  tags.forEach((t) => {
    tagBySlug[t.slug] = t.id;
  });

  // Helper to ensure tag exists
  async function ensureTag(name, slug, group, icon, description) {
    if (tagBySlug[slug]) return tagBySlug[slug];
    console.log(`➕ Creating tag "${name}" (${slug})...`);
    const res = await request(
      'POST',
      '/tags',
      { name, slug, group, icon, description },
      token,
    );
    if (res.status === 201 && res.data?.data?.id) {
      tagBySlug[slug] = res.data.data.id;
      return res.data.data.id;
    }
    return null;
  }

  // Ensure necessary tags
  await ensureTag('Summer', 'summer', 'Occasion', '☀️', 'Lightweight warm-weather crochet pieces');
  await ensureTag('Winter Warmth', 'winter', 'Occasion', '❄️', 'Cozy thermal handmade pieces');
  await ensureTag('Bohemian', 'bohemian', 'Style', '🌾', 'Free-spirited earthy crochet accents');
  await ensureTag('Pastel Shades', 'pastel', 'Style', '🎨', 'Gentle soothing pastel hues');
  await ensureTag('Home Accents', 'home-decor', 'Product Type', '🛋️', 'Charming decor touches for living spaces');

  console.log('📦 Total available tags:', Object.keys(tagBySlug).length);

  // Define 5 Products in Each of the 6 Categories (Total 30 Products)
  const products = [
    // ==========================================
    // 1. ACCESSORIES & KEYCHAINS (5 Products)
    // ==========================================
    {
      name: 'Mini Sunburst Daisy Crochet Charm Keychain',
      slug: 'mini-sunburst-daisy-crochet-charm-keychain',
      description: 'Handcrafted cheerful miniature sunflower keychain with textured golden-amber center and pure white petals. Comes with a hypoallergenic golden lobster claw clasp and mini leaf detail. Perfect for organizing keys or styling backpacks and tote bags.',
      price: 299,
      compareAtPrice: 399,
      stock: 35,
      categorySlug: 'keychains-bag-charms', // subcategory under accessories-keychains
      tagSlugs: ['keychain', 'flower', 'cute', 'handmade', 'aesthetic'],
      isFeatured: true,
      materials: '100% Combed Milk Cotton Yarn, Anti-Tarnish Gold Alloy Clasp',
      dimensions: '8 cm length x 5.5 cm flower diameter',
      careInstructions: 'Spot clean with mild soap and damp cloth. Air dry flat.',
      craftingTime: 'Handcrafted in 2 hours',
      weight: '25g',
      sku: 'CR-ACC-SUN-01',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Pastel Botanical Hanging Succulent Car Mirror Charm',
      slug: 'pastel-botanical-hanging-succulent-car-mirror-charm',
      description: 'Breathe tranquility into your commute with this darling hanging potted succulent. Features three cascading jade-green vines and an oatmeal crochet terracotta pot with adjustable hanger twine.',
      price: 399,
      compareAtPrice: 499,
      stock: 24,
      categorySlug: 'car-mirror-hangings',
      tagSlugs: ['keychains', 'aesthetic', 'eco-friendly', 'customizable', 'modern'],
      isFeatured: false,
      materials: 'Organic Bamboo & Cotton Blend Yarn, Wooden Accent Bead',
      dimensions: 'Pot 6 cm height, Vines 15 cm hanging drop',
      careInstructions: 'Dust lightly with a soft brush. Keep away from direct soaking.',
      craftingTime: 'Handcrafted in 3 hours',
      weight: '45g',
      sku: 'CR-ACC-SUC-02',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Fluffy Daisy Pastel Crochet Scrunchie Set (Pack of 3)',
      slug: 'fluffy-daisy-pastel-crochet-scrunchie-set',
      description: 'Luxuriously soft hair scrunchies handmade with gentle milk cotton ruffles and miniature daisy embroidery. Designed to prevent hair creases, friction, and breakage while adding a whimsical boho charm.',
      price: 349,
      compareAtPrice: 449,
      stock: 40,
      categorySlug: 'hair-scrunchies-clips',
      tagSlugs: ['women', 'aesthetic', 'flower', 'pastel', 'handmade'],
      isFeatured: false,
      materials: 'Extra-Soft Milk Cotton Yarn, Heavy-Duty Elastic Core',
      dimensions: '11 cm outer diameter, stretches comfortably to 20 cm',
      careInstructions: 'Hand wash gently in lukewarm water; lay flat to dry on a towel.',
      craftingTime: 'Handcrafted in 2.5 hours',
      weight: '60g',
      sku: 'CR-ACC-SCR-03',
      images: [
        { imageUrl: 'http://localhost:5000/uploads/crochet_hair_accessories_1788427096752.jpg', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Artisan Boba Bubble Milk Tea Bag Charm',
      slug: 'artisan-boba-bubble-milk-tea-bag-charm',
      description: 'Ultra-cute miniature cup of brown sugar milk tea topped with cream swirl and crochet tapioca pearls. Embellished with a pastel striped straw and golden key clip for backpacks and purses.',
      price: 279,
      compareAtPrice: 349,
      stock: 30,
      categorySlug: 'keychains-bag-charms',
      tagSlugs: ['cute', 'keychain', 'kids', 'toys', 'handmade'],
      isFeatured: false,
      materials: '100% Mercerized Cotton Yarn, Premium Polyester Stuffing',
      dimensions: '7.5 cm height x 4.5 cm diameter',
      careInstructions: 'Wipe clean with a damp microfiber cloth.',
      craftingTime: 'Handcrafted in 2 hours',
      weight: '30g',
      sku: 'CR-ACC-BOB-04',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Retro Cottagecore Daisy Crochet Hair Clip & Pin Duo',
      slug: 'retro-cottagecore-daisy-crochet-hair-clip-pin-duo',
      description: 'Pair of nostalgic 90s-inspired alligator hair clips layered with handcrafted micro-crochet daisies in French butter and blush pink. Nonslip metal clips hold securely in fine and thick hair alike.',
      price: 249,
      compareAtPrice: 329,
      stock: 50,
      categorySlug: 'hair-scrunchies-clips',
      tagSlugs: ['women', 'aesthetic', 'flower', 'minimalist', 'handmade'],
      isFeatured: false,
      materials: 'Fine Lace Cotton Thread, Velvet-Lined Alligator Metal Clips',
      dimensions: '6 cm length each',
      careInstructions: 'Spot clean only. Keep metal components dry.',
      craftingTime: 'Handcrafted in 1.5 hours',
      weight: '20g',
      sku: 'CR-ACC-CLP-05',
      images: [
        { imageUrl: 'http://localhost:5000/uploads/crochet_hair_accessories_1788427096752.jpg', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },

    // ==========================================
    // 2. AMIGURUMI & PLUSHIES (5 Products)
    // ==========================================
    {
      name: 'Chubby Velvet Bunny Plushie in Strawberry Pinafore',
      slug: 'chubby-velvet-bunny-plushie-in-strawberry-pinafore',
      description: 'Irresistibly plush amigurumi bunny rabbit stitched with feather-soft chenille yarn. Includes embroidered rosy cheeks, floppy ears, and a detachable pastel strawberry dress with mini pearl buttons.',
      price: 999,
      compareAtPrice: 1299,
      stock: 18,
      categorySlug: 'animal-plushies',
      tagSlugs: ['amigurumi', 'cute', 'kids', 'babies', 'handmade'],
      isFeatured: true,
      materials: 'Hypoallergenic Chenille Yarn, Safety Eyes, Recycled Polyfill',
      dimensions: '24 cm standing height x 14 cm width',
      careInstructions: 'Gentle hand wash or place in laundry bag on delicate cold cycle. Air dry flat.',
      craftingTime: 'Handcrafted in 7 hours',
      weight: '210g',
      sku: 'CR-AMI-BUN-01',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Handmade Devotional Crochet Ganpati Bappa Idol',
      slug: 'handmade-devotional-crochet-ganpati-bappa-idol',
      description: 'Bless your sacred home altar or workspace with this divine, meticulously handcrafted Lord Ganesha crochet idol. Detailed with golden crown (Mukut), Modak sweet in hand, intricate trunk curve, and sacred yellow pitambar.',
      price: 1499,
      compareAtPrice: 1899,
      stock: 15,
      categorySlug: 'devotional-heritage-idols',
      tagSlugs: ['traditional', 'customizable', 'handmade', 'anniversary', 'aesthetic'],
      isFeatured: true,
      materials: 'Pure Cotton Yarn, Metallic Golden Zari Thread, Hypoallergenic Fiberfill',
      dimensions: '18 cm height x 15 cm base width',
      careInstructions: 'Wipe gently with dry cotton cloth. Do not immerse in water.',
      craftingTime: 'Handcrafted in 12 hours of sacred artisan work',
      weight: '280g',
      sku: 'CR-AMI-GAN-02',
      images: [
        { imageUrl: 'http://localhost:5000/uploads/crochet_ganpati_bappa_1788427070136.jpg', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Sleepy Bear Teddy Plushie in Oatmeal Overalls',
      slug: 'sleepy-bear-teddy-plushie-in-oatmeal-overalls',
      description: 'Classic heirloom style crochet teddy bear in honey-brown organic cotton with removable textured waffle overalls. Weighted safely in the base so it sits peacefully on nursery shelves and study tables.',
      price: 1199,
      compareAtPrice: 1499,
      stock: 20,
      categorySlug: 'animal-plushies',
      tagSlugs: ['amigurumi', 'toys', 'baby-shower', 'kids', 'premium-yarn'],
      isFeatured: false,
      materials: '100% GOTS Organic Cotton Yarn, Embroidered Facial Features (No Plastic)',
      dimensions: '28 cm seated height',
      careInstructions: 'Machine washable in a gentle mesh bag on delicate cold cycle.',
      craftingTime: 'Handcrafted in 9 hours',
      weight: '260g',
      sku: 'CR-AMI-BEA-03',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Kawaii Ocean Whale Amigurumi Plush Trio',
      slug: 'kawaii-ocean-whale-amigurumi-plush-trio',
      description: 'Delightful family of three pocket-sized crochet whales in seafoam, sky blue, and baby pink. Complete with tiny water spouts and plush white bellies.',
      price: 799,
      compareAtPrice: 999,
      stock: 25,
      categorySlug: 'character-miniatures',
      tagSlugs: ['cute', 'toys', 'kids', 'minimalist', 'birthday'],
      isFeatured: false,
      materials: 'Soft Acrylic-Cotton Blend Yarn, Hypoallergenic Polyfill',
      dimensions: 'Small: 7 cm, Medium: 10 cm, Large: 14 cm length',
      careInstructions: 'Surface clean with mild baby soap and air dry.',
      craftingTime: 'Handcrafted in 5 hours total',
      weight: '140g',
      sku: 'CR-AMI-WHL-04',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Artisan Woodland Rust Fox Stuffed Animal',
      slug: 'artisan-woodland-rust-fox-stuffed-animal',
      description: 'Intricately stitched red woodland fox featuring a fluffy white tail tip, alert pointed ears, and a cozy sage green knitted neck scarf. Perfect autumn forest companion.',
      price: 1299,
      compareAtPrice: 1599,
      stock: 12,
      categorySlug: 'animal-plushies',
      tagSlugs: ['amigurumi', 'toys', 'kids', 'aesthetic', 'handmade'],
      isFeatured: false,
      materials: 'Wool-Cotton Heather Blend, Secure Locked Safety Eyes',
      dimensions: '22 cm sitting height x 16 cm width',
      careInstructions: 'Spot clean only. Brush tail gently with soft bristled brush.',
      craftingTime: 'Handcrafted in 8 hours',
      weight: '230g',
      sku: 'CR-AMI-FOX-05',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },

    // ==========================================
    // 3. BAGS & PURSES (5 Products)
    // ==========================================
    {
      name: 'Sunburst Daisy Motif Bohemian Shoulder Bag',
      slug: 'sunburst-daisy-motif-bohemian-shoulder-bag',
      description: 'Statement summer purse hand-crocheted from 16 joined sunburst daisy squares in warm terracotta, ivory, and mustard hues. Lined with sturdy natural linen canvas featuring an interior zip pocket and reinforced braided handles.',
      price: 1899,
      compareAtPrice: 2499,
      stock: 14,
      categorySlug: 'crossbody-shoulder-bags',
      tagSlugs: ['bags', 'purse', 'flower', 'women', 'handmade'],
      isFeatured: true,
      materials: '100% Pure Heavy-Twist Cotton Yarn, Natural Linen Lining, Brass YKK Zipper',
      dimensions: '36 cm width x 32 cm height, 58 cm handle drop',
      careInstructions: 'Hand wash in cold water; reshape while damp and lay flat to dry in shade.',
      craftingTime: 'Handcrafted over 18 hours',
      weight: '480g',
      sku: 'CR-BAG-SUN-01',
      images: [
        { imageUrl: 'http://localhost:5000/uploads/crochet_master_bags_1788428531823.jpg', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Vintage Pastel Granny Square French Market Tote',
      slug: 'vintage-pastel-granny-square-french-market-tote',
      description: 'Generous everyday grocery and beach tote bag composed of pastel geometric granny squares. Expanding diamond mesh sides effortlessly accommodate fresh flowers, books, and farmers market finds.',
      price: 1599,
      compareAtPrice: 1999,
      stock: 20,
      categorySlug: 'tote-bags',
      tagSlugs: ['bags', 'eco-friendly', 'aesthetic', 'women', 'premium-yarn'],
      isFeatured: false,
      materials: 'Recycled Eco-Cotton Yarn, Double-Reinforced Stitch Base',
      dimensions: '42 cm width x 38 cm height, expands up to 18 cm depth',
      careInstructions: 'Machine washable on gentle cold cycle. Do not wring or bleach.',
      craftingTime: 'Handcrafted in 14 hours',
      weight: '410g',
      sku: 'CR-BAG-TOT-02',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Pearl Beaded Handle Tulip Crossbody Clutch Pouch',
      slug: 'pearl-beaded-handle-tulip-crossbody-clutch-pouch',
      description: 'A romantic evening clutch adorned with raised 3D crochet tulips and detachable faux pearl wristlet strap. Also comes with an antique brass chain for hands-free crossbody styling.',
      price: 1399,
      compareAtPrice: 1799,
      stock: 16,
      categorySlug: 'clutch-pouches',
      tagSlugs: ['purse', 'flower', 'aesthetic', 'women', 'valentines-day'],
      isFeatured: false,
      materials: 'Silky Bamboo-Cotton Yarn, Faux Pearl Chain, Magnetic Snap Closure',
      dimensions: '22 cm length x 16 cm height x 6 cm gusset',
      careInstructions: 'Wipe outer crochet with damp cloth. Detach pearl strap before cleaning.',
      craftingTime: 'Handcrafted in 8 hours',
      weight: '320g',
      sku: 'CR-BAG-TUL-03',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'http://localhost:5000/uploads/crochet_master_bags_1788428531823.jpg', displayOrder: 1 },
      ],
    },
    {
      name: 'Textured Ribbed Everyday Canvas-Lined Handbag',
      slug: 'textured-ribbed-everyday-canvas-lined-handbag',
      description: 'Modern minimalist handbag with dense alpine stitch texture in deep mocha and almond. Features structured flat base, premium vegan leather handles, and dual organizer pockets inside.',
      price: 1999,
      compareAtPrice: 2599,
      stock: 10,
      categorySlug: 'tote-bags',
      tagSlugs: ['bags', 'minimalist', 'modern', 'women', 'customizable'],
      isFeatured: false,
      materials: 'Chunky Cotton Cord, Vegan PU Leather Handles, Cotton Duck Lining',
      dimensions: '34 cm width x 26 cm height x 12 cm depth',
      careInstructions: 'Spot clean exterior with damp sponge. Air dry away from direct heater.',
      craftingTime: 'Handcrafted in 16 hours',
      weight: '520g',
      sku: 'CR-BAG-RIB-04',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Bohemian Fringe Crochet Envelope Clutch with Wooden Clasp',
      slug: 'bohemian-fringe-crochet-envelope-clutch-with-wooden-clasp',
      description: 'Earthy festival envelope clutch crafted with chevron textured stitches, hand-tied fringe tassels, and a handcrafted natural teak wood toggle closure.',
      price: 1199,
      compareAtPrice: 1549,
      stock: 18,
      categorySlug: 'clutch-pouches',
      tagSlugs: ['purse', 'women', 'traditional', 'aesthetic', 'anniversary'],
      isFeatured: false,
      materials: 'Unbleached Natural Cotton Macrame Cord, Carved Teakwood Button',
      dimensions: '26 cm width x 18 cm height (plus 8 cm fringe)',
      careInstructions: 'Gently comb fringe with a wide-tooth comb. Spot clean only.',
      craftingTime: 'Handcrafted in 6 hours',
      weight: '290g',
      sku: 'CR-BAG-ENV-05',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'http://localhost:5000/uploads/crochet_master_bags_1788428531823.jpg', displayOrder: 1 },
      ],
    },

    // ==========================================
    // 4. BOTANICAL & FLOWERS (5 Products)
    // ==========================================
    {
      name: 'Everlasting Crimson Rose & Baby’s Breath Bouquet',
      slug: 'everlasting-crimson-rose-babys-breath-bouquet',
      description: 'An eternal romantic declaration that will never wilt. Handcrafted bundle of 5 deep crimson velvet crochet roses, 3 blush buds, and delicate white baby’s breath stems wrapped in artisanal brown kraft paper and tied with satin ribbon.',
      price: 1699,
      compareAtPrice: 2199,
      stock: 22,
      categorySlug: 'handmade-bouquets',
      tagSlugs: ['flowers', 'valentines-day', 'anniversary', 'couples', 'handmade'],
      isFeatured: true,
      materials: 'Velvet-Touch Microfiber Yarn, Bendable Floral Wire Stems, Kraft Paper Wrap',
      dimensions: '38 cm bouquet height x 22 cm bloom spread',
      careInstructions: 'Dust periodically with a cool hairdryer on low setting. Never needs water.',
      craftingTime: 'Handcrafted in 12 hours',
      weight: '310g',
      sku: 'CR-BOT-ROS-01',
      images: [
        { imageUrl: 'http://localhost:5000/uploads/crochet_master_flowers_1788428559503.jpg', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Pastel Lavender & Chamomile Meadow Flower Bunch',
      slug: 'pastel-lavender-chamomile-meadow-flower-bunch',
      description: 'Calming French country floral bouquet featuring 6 textured lilac lavender spires, 4 white daisy chamomile blooms with yellow centers, and eucalyptus leaves. Gently infused with organic lavender essential oil for a soothing scent.',
      price: 1299,
      compareAtPrice: 1699,
      stock: 28,
      categorySlug: 'handmade-bouquets',
      tagSlugs: ['flowers', 'aesthetic', 'birthday', 'minimalist', 'eco-friendly'],
      isFeatured: false,
      materials: 'Natural Combed Cotton, Flexible Iron Florist Stems, Essential Oil Scenting',
      dimensions: '35 cm length x 18 cm width',
      careInstructions: 'Keep dry. Reapply 1 drop of your favorite essential oil to wool leaves if desired.',
      craftingTime: 'Handcrafted in 9 hours',
      weight: '240g',
      sku: 'CR-BOT-LAV-02',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'http://localhost:5000/uploads/crochet_master_flowers_1788428559503.jpg', displayOrder: 1 },
      ],
    },
    {
      name: 'Blooming Sunflower in Terracotta Pot Desk Accent',
      slug: 'blooming-sunflower-in-terracotta-pot-desk-accent',
      description: 'A radiant potted sunflower that permanently brightens your study table or office desk. Features dark brown textured seed head with double layer amber petals planted in a weighted mini terracotta-tone knit pot.',
      price: 699,
      compareAtPrice: 899,
      stock: 30,
      categorySlug: 'potted-plant-decor',
      tagSlugs: ['flowers', 'flower', 'modern', 'birthday', 'handmade'],
      isFeatured: false,
      materials: 'Mercerized Cotton Yarn, Weighted Mineral Base, Wire Stem Support',
      dimensions: '20 cm total height x 11 cm flower head diameter',
      careInstructions: 'Brush gently to remove dust. Stems can be angled into desired direction.',
      craftingTime: 'Handcrafted in 4.5 hours',
      weight: '160g',
      sku: 'CR-BOT-SUN-03',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Trio of French Velvet Tulip Crochet Stems',
      slug: 'trio-of-french-velvet-tulip-crochet-stems',
      description: 'Three tall elegant tulip stems in coral blush, buttermilk, and soft mauve. Sculpted petals with internal poseable wires let you arrange closed buds or blooming profiles in any glass vase.',
      price: 799,
      compareAtPrice: 1049,
      stock: 32,
      categorySlug: 'single-blossom-stems',
      tagSlugs: ['flowers', 'aesthetic', 'couples', 'valentines-day', 'women'],
      isFeatured: false,
      materials: 'Milk Cotton Yarn, Floral Stiffener Wire, Cotton Leaf Wrap',
      dimensions: '32 cm stem length each, 6 cm tulip head height',
      careInstructions: 'Adjust wire stems to fit your vase height. Do not soak in water.',
      craftingTime: 'Handcrafted in 5 hours',
      weight: '110g',
      sku: 'CR-BOT-TUL-04',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'http://localhost:5000/uploads/crochet_master_flowers_1788428559503.jpg', displayOrder: 1 },
      ],
    },
    {
      name: 'Cascading Potted String of Pearls Hanging Crochet Succulent',
      slug: 'cascading-potted-string-of-pearls-hanging-crochet-succulent',
      description: 'Zero-maintenance botanical masterpiece featuring dozens of plump crochet pearls cascading over a miniature textured hanging basket. Comes with braided hanging macrame ropes ready to mount on wall hooks.',
      price: 899,
      compareAtPrice: 1199,
      stock: 20,
      categorySlug: 'potted-plant-decor',
      tagSlugs: ['flowers', 'aesthetic', 'eco-friendly', 'modern', 'minimalist'],
      isFeatured: false,
      materials: 'Moss-Green Milk Cotton Yarn, Jute Twine Hanging Loop',
      dimensions: '10 cm pot diameter, 35 cm longest cascading pearl vine',
      careInstructions: 'Blow dust away with low air setting or feather duster.',
      craftingTime: 'Handcrafted in 7 hours',
      weight: '190g',
      sku: 'CR-BOT-STR-05',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },

    // ==========================================
    // 5. HOME DECOR & LIVING (5 Products)
    // ==========================================
    {
      name: 'Heirloom Waffle Stitch Pastel Cotton Throw Blanket',
      slug: 'heirloom-waffle-stitch-pastel-cotton-throw-blanket',
      description: 'Unbelievably cozy and weighted waffle-knit heirloom crochet blanket crafted in calming oat and sage tones. Designed to drape elegantly across couches and queen beds while offering breathable warmth in all seasons.',
      price: 3899,
      compareAtPrice: 4799,
      stock: 8,
      categorySlug: 'throws-blankets',
      tagSlugs: ['aesthetic', 'premium-yarn', 'handmade', 'minimalist', 'modern'],
      isFeatured: true,
      materials: '100% Certified Organic Combed Cotton Chunky Yarn',
      dimensions: '150 cm x 125 cm (Throw Blanket)',
      careInstructions: 'Machine wash delicate cycle in cold water. Lay flat to dry to preserve stitch tension.',
      craftingTime: 'Handcrafted over 45 hours of artisan labor',
      weight: '1150g',
      sku: 'CR-HOM-WAF-01',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Handmade Botanical Daisy Drink Coasters (Set of 4)',
      slug: 'handmade-botanical-daisy-drink-coasters-set-of-4',
      description: 'Charming quartet of floral mug coasters hand-knit with dense double-layered absorbent cotton. Protects wood and glass table surfaces from hot mugs and icy glass condensation with cottagecore beauty.',
      price: 499,
      compareAtPrice: 699,
      stock: 45,
      categorySlug: 'mug-coasters-placemats',
      tagSlugs: ['flower', 'aesthetic', 'eco-friendly', 'modern', 'handmade'],
      isFeatured: false,
      materials: '100% Natural Absorbent Indian Cotton Yarn',
      dimensions: '12 cm diameter each',
      careInstructions: 'Hand wash with mild dish soap; press flat with an iron on medium steam.',
      craftingTime: 'Handcrafted in 4 hours per set',
      weight: '90g per set',
      sku: 'CR-HOM-COA-02',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Boho Mandala Tapestry Crochet Wall Hanging with Wooden Dowel',
      slug: 'boho-mandala-tapestry-crochet-wall-hanging',
      description: 'Intricate geometric mandala wall banner worked in natural ivory, warm sand, and sage green yarn mounted on a genuine hand-sanded pine dowel. Finished with hand-knotted fringe bottom.',
      price: 1899,
      compareAtPrice: 2399,
      stock: 12,
      categorySlug: 'wall-hangings-baskets',
      tagSlugs: ['traditional', 'aesthetic', 'modern', 'customizable', 'handmade'],
      isFeatured: false,
      materials: 'Natural Unbleached Cotton Rope, Pine Wood Rod',
      dimensions: '45 cm width x 70 cm hanging length',
      careInstructions: 'Lightly shake out dust outdoors or spot clean. Do not submerge wooden rod.',
      craftingTime: 'Handcrafted in 15 hours',
      weight: '490g',
      sku: 'CR-HOM-WAL-03',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Cotton Rope & Crochet Nesting Storage Baskets (Set of 2)',
      slug: 'cotton-rope-and-crochet-nesting-storage-baskets-set-of-2',
      description: 'Sturdy freestanding artisan baskets with faux leather side handles. Ideal for organizing vanity makeup, keys, yarn skeins, baby nursery essentials, and tabletop trinkets.',
      price: 1399,
      compareAtPrice: 1799,
      stock: 16,
      categorySlug: 'wall-hangings-baskets',
      tagSlugs: ['minimalist', 'eco-friendly', 'modern', 'handmade', 'cute'],
      isFeatured: false,
      materials: 'Sturdy Cotton Cord, Vegan Leather Studs',
      dimensions: 'Large: 22 cm diameter x 14 cm height; Small: 16 cm diameter x 11 cm height',
      careInstructions: 'Spot clean with mild detergent and water. Reshape by packing with towels.',
      craftingTime: 'Handcrafted in 10 hours',
      weight: '620g for set',
      sku: 'CR-HOM-BAS-04',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Sunburst Floral Table Runner in Natural Oatmeal Linen',
      slug: 'sunburst-floral-table-runner-in-natural-oatmeal-linen',
      description: 'Spectacular dining table centerpiece crafted from connected floral crochet medallions with scalloped lace picot edging. Transforms ordinary dinners into elevated cottage feast celebrations.',
      price: 2199,
      compareAtPrice: 2799,
      stock: 10,
      categorySlug: 'mug-coasters-placemats',
      tagSlugs: ['traditional', 'aesthetic', 'flower', 'anniversary', 'handmade'],
      isFeatured: false,
      materials: '100% Linen-Cotton Mercerized Thread',
      dimensions: '160 cm length x 35 cm width',
      careInstructions: 'Hand wash cold with wool wash; block and steam press with warm iron.',
      craftingTime: 'Handcrafted in 22 hours',
      weight: '380g',
      sku: 'CR-HOM-RUN-05',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },

    // ==========================================
    // 6. WEARABLES & CLOTHING (5 Products)
    // ==========================================
    {
      name: 'Vintage Blossom Pastel Granny Square Cardigan',
      slug: 'vintage-blossom-pastel-granny-square-cardigan',
      description: 'Our flagship wearable masterpiece: an oversized heirloom cardigan pieced together from 64 floral granny squares in vintage lilac, buttercup yellow, and matcha green. Features rib-knit collar, balloon sleeves, and authentic horn toggle buttons.',
      price: 3499,
      compareAtPrice: 4299,
      stock: 9,
      categorySlug: 'cardigans-sweaters',
      tagSlugs: ['cardigan', 'clothing', 'women', 'aesthetic', 'handmade'],
      isFeatured: true,
      materials: 'Ultra-Soft Milk Cotton & Merino Wool Blend, Natural Coconut Wood Toggles',
      dimensions: 'One Size Relaxed Fit (Chest 112 cm, Length 68 cm, Sleeve 55 cm)',
      careInstructions: 'Dry clean recommended or gentle hand wash cold with wool detergent. Never wring.',
      craftingTime: 'Handcrafted over 52 hours of continuous crochet art',
      weight: '780g',
      sku: 'CR-WEA-CAR-01',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Bohemian Ripple Wave Halter Crochet Crop Top',
      slug: 'bohemian-ripple-wave-halter-crochet-crop-top',
      description: 'Breezy summer festival crop top featuring chevron wave stripes in terracotta, cream, and olive. Designed with adjustable neck halter tie and criss-cross corset back lace-up for a customizable, flattering fit.',
      price: 1299,
      compareAtPrice: 1699,
      stock: 20,
      categorySlug: 'tops-skirt-sets',
      tagSlugs: ['clothing', 'women', 'aesthetic', 'modern', 'summer'],
      isFeatured: false,
      materials: '100% Breathable Combed Cotton Summer Yarn',
      dimensions: 'Adjustable fit (Bust 30” - 38”, Length 32 cm)',
      careInstructions: 'Hand wash in cold water; lay flat on mesh dryer.',
      craftingTime: 'Handcrafted in 8 hours',
      weight: '160g',
      sku: 'CR-WEA-TOP-02',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Retro Daisy Patchwork Reversible Bucket Hat',
      slug: 'retro-daisy-patchwork-reversible-bucket-hat',
      description: 'Y2K inspired cottagecore bucket hat crafted from daisy flower granny squares with a wavy sun-protective brim. Breathable, fold-packable, and holds its relaxed shape through summer adventures.',
      price: 899,
      compareAtPrice: 1199,
      stock: 28,
      categorySlug: 'hats-beanies-scarves',
      tagSlugs: ['clothing', 'flower', 'cute', 'women', 'aesthetic'],
      isFeatured: false,
      materials: '100% Heavy Organic Cotton Yarn',
      dimensions: 'Head Circumference 56-59 cm (Unisex Adult Flexible Fit)',
      careInstructions: 'Hand wash cold, reshape around a bowl while damp to preserve brim curve.',
      craftingTime: 'Handcrafted in 6 hours',
      weight: '130g',
      sku: 'CR-WEA-HAT-03',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Cozy Ribbed Slouchy Beanie with Fold-Up Brim',
      slug: 'cozy-ribbed-slouchy-beanie-with-fold-up-brim',
      description: 'Supremely soft ribbed knit winter beanie with elastic stretch recovery. Deep neutral charcoal and heather oatmeal colors suit both men and women seamlessly during chilly morning walks.',
      price: 749,
      compareAtPrice: 999,
      stock: 35,
      categorySlug: 'hats-beanies-scarves',
      tagSlugs: ['clothing', 'men', 'women', 'minimalist', 'premium-yarn'],
      isFeatured: false,
      materials: 'Merino Wool & Anti-Pill Microfiber Blend',
      dimensions: 'Universal Stretch Fit (24 cm length unfolded x 21 cm flat width)',
      careInstructions: 'Gentle wool cycle or hand wash cold. Lay flat to dry.',
      craftingTime: 'Handcrafted in 5 hours',
      weight: '95g',
      sku: 'CR-WEA-BEA-04',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
    {
      name: 'Artisan Chunky Knit Bell-Sleeve Pullover Sweater',
      slug: 'artisan-chunky-knit-bell-sleeve-pullover-sweater',
      description: 'Statement boat-neck sweater with drop shoulders, flared bell sleeves, and intricate moss stitch patterns. Airy open-weave texture keeps you effortlessly chic over bralettes or camisoles.',
      price: 2999,
      compareAtPrice: 3799,
      stock: 11,
      categorySlug: 'cardigans-sweaters',
      tagSlugs: ['clothing', 'cardigan', 'women', 'premium-yarn', 'handmade'],
      isFeatured: false,
      materials: 'Natural Spun Bamboo-Cotton Cable Yarn',
      dimensions: 'Relaxed Fit (Bust up to 106 cm, Length 58 cm, Sleeve 50 cm)',
      careInstructions: 'Hand wash gently in cold water with gentle fabric conditioner. Dry flat.',
      craftingTime: 'Handcrafted in 36 hours',
      weight: '620g',
      sku: 'CR-WEA-SWE-05',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
      ],
    },
  ];

  console.log(`\n🚀 Starting ingestion of ${products.length} products via Admin API...`);
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const catId = catBySlug[p.categorySlug];
    if (!catId) {
      console.warn(`⚠️ Category "${p.categorySlug}" not found! Skipping "${p.name}".`);
      skippedCount++;
      continue;
    }

    const tagIds = (p.tagSlugs || [])
      .map((slug) => tagBySlug[slug])
      .filter(Boolean);

    const payload = {
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      stock: p.stock,
      categoryId: catId,
      tagIds,
      images: p.images,
      isFeatured: p.isFeatured,
      isActive: true,
      materials: p.materials,
      dimensions: p.dimensions,
      careInstructions: p.careInstructions,
      craftingTime: p.craftingTime,
      weight: p.weight,
      sku: p.sku,
    };

    const res = await request('POST', '/products', payload, token);

    if (res.status === 201) {
      createdCount++;
      console.log(`[${i + 1}/${products.length}] ✅ Created: "${p.name}" (₹${p.price}) with ${tagIds.length} tags`);
    } else if (res.status === 409) {
      // Already exists by slug, fetch existing product and update
      const existingRes = await request('GET', `/products/slug/${p.slug}`);
      if (existingRes.data?.data?.id) {
        const existingId = existingRes.data.data.id;
        const updateRes = await request('PUT', `/products/${existingId}`, payload, token);
        if (updateRes.status === 200) {
          updatedCount++;
          console.log(`[${i + 1}/${products.length}] 🔄 Updated existing: "${p.name}"`);
        } else {
          console.warn(`[${i + 1}/${products.length}] ⚠️ Update failed:`, updateRes.data);
        }
      } else {
        console.warn(`[${i + 1}/${products.length}] ⚠️ Conflict, could not resolve slug: ${p.slug}`);
      }
    } else {
      console.error(`[${i + 1}/${products.length}] ❌ Failed to create "${p.name}":`, res.status, res.data);
    }
  }

  console.log('\n=========================================');
  console.log('🎉 INGESTION FINISHED!');
  console.log(`✨ Created: ${createdCount}`);
  console.log(`🔄 Updated: ${updatedCount}`);
  console.log(`⚠️ Skipped: ${skippedCount}`);
  console.log(`📦 Total Processed: ${products.length}`);
  console.log('=========================================\n');
}

main().catch((err) => {
  console.error('Fatal error running ingestion:', err);
  process.exit(1);
});
