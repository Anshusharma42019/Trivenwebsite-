import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';

// Fix querySrv ECONNREFUSED on networks/ISPs with faulty SRV record resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayurvedic_store';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;

  console.log('Clearing existing collections...');
  const collections = ['users', 'products', 'categories', 'brands', 'coupons', 'banners', 'storesettings', 'stockmovements'];
  for (const col of collections) {
    try {
      await db.collection(col).drop();
    } catch (e) {
      // collection may not exist yet
    }
  }

  console.log('Creating default Store Settings...');
  await db.collection('storesettings').insertOne({
    storeName: 'Triven Ayurveda',
    tagline: 'Pure Classical Vedic Formulations for Holistic Wellness',
    supportEmail: 'care@trivenayurveda.com',
    supportPhone: '+91 98765 43210',
    address: 'Ayurveda Bhavan, Sector 12, Haridwar, Uttarakhand - 249401, India',
    currency: 'INR',
    currencySymbol: '₹',
    freeShippingThreshold: 999,
    defaultShippingFee: 70,
    codEnabled: true,
    codFee: 40,
    maintenanceMode: false,
    announcementBar: {
      enabled: true,
      text: '🌿 Pure AYUSH Certified Herbs • Free express delivery across India on orders above ₹999 • Cod Available',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Creating Super Admin & Staff Accounts...');
  const salt = await bcrypt.genSalt(12);
  const adminPasswordHash = await bcrypt.hash('Admin@Ayur2026', salt);
  const staffPasswordHash = await bcrypt.hash('Staff@Ayur2026', salt);
  const customerPasswordHash = await bcrypt.hash('Customer@123', salt);

  const adminResult = await db.collection('users').insertOne({
    name: 'Dr. Acharya Devraj',
    email: 'admin@trivenayurveda.com',
    password: adminPasswordHash,
    role: 'super_admin',
    phone: '+91 98765 00001',
    status: 'active',
    customPermissions: [],
    addresses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const staffResult = await db.collection('users').insertOne({
    name: 'Vaidya Ramesh Sharma',
    email: 'manager@trivenayurveda.com',
    password: staffPasswordHash,
    role: 'product_manager',
    phone: '+91 98765 00002',
    status: 'active',
    customPermissions: [],
    addresses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const customerResult = await db.collection('users').insertOne({
    name: 'Ananya Verma',
    email: 'ananya@example.com',
    password: customerPasswordHash,
    role: 'customer',
    phone: '+91 98765 11111',
    status: 'active',
    customPermissions: [],
    addresses: [
      {
        fullName: 'Ananya Verma',
        phone: '+91 98765 11111',
        addressLine1: 'Flat 402, Lotus Greens Apartment',
        addressLine2: 'Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201309',
        isDefault: true,
        type: 'home',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Creating Categories...');
  const categories = [
    {
      name: 'Herbal Supplements',
      slug: 'herbal-supplements',
      description: 'Ancient rasayanas and organic extracts for stamina, vitality, and cellular balance.',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Ayurvedic Oils & Tailas',
      slug: 'ayurvedic-oils',
      description: 'Traditional slow-infused herbal oils cooked in sesame, castor, and coconut bases.',
      image: 'https://images.unsplash.com/photo-1608248597359-54a7c866b8fb?auto=format&fit=crop&q=80&w=600',
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Digestive & Gut Wellness',
      slug: 'digestive-wellness',
      description: 'Strengthen Agni (digestive fire), alleviate bloat, and balance gut flora naturally.',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Skin & Hair Elixirs',
      slug: 'skin-and-hair',
      description: 'Nourishing botanicals, saffron serums, and bhringraj formulations for natural glow.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600',
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Immunity & Rasayana',
      slug: 'immunity-rasayana',
      description: 'Time-tested Ayurvedic formulations to build Ojas and protect natural immunity.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600',
      sortOrder: 5,
      isActive: true,
    },
  ];

  const catDocs = await db.collection('categories').insertMany(categories);
  const catMap = {};
  categories.forEach((c, idx) => {
    catMap[c.slug] = catDocs.insertedIds[idx];
  });

  console.log('Creating Brands...');
  const brands = [
    {
      name: 'Triven Pure Heritage',
      slug: 'triven-pure-heritage',
      description: 'Proprietary classical formulations sourced directly from Uttarakhand farms.',
      manufacturerDetails: {
        name: 'Triven Ayur Labs Pvt Ltd',
        licenseNo: 'AYUSH-UK/L-442/2021',
        address: 'Haridwar Industrial Area, Uttarakhand - 249401',
      },
      isActive: true,
    },
    {
      name: 'Kottakkal Arya Vaidya Sala',
      slug: 'kottakkal',
      description: 'Centuries of Kerala Ayurvedic excellence and authentic classical texts.',
      manufacturerDetails: {
        name: 'Arya Vaidya Sala Kottakkal',
        licenseNo: 'KL-AYU-0012/1902',
        address: 'Malappuram, Kerala - 676503',
      },
      isActive: true,
    },
  ];

  const brandDocs = await db.collection('brands').insertMany(brands);
  const trivenBrandId = brandDocs.insertedIds[0];
  const kottakkalBrandId = brandDocs.insertedIds[1];

  console.log('Creating Authentic Ayurvedic Products...');
  const products = [
    {
      name: 'Organic Ashwagandha KSM-66 Churna',
      slug: 'organic-ashwagandha-ksm-66-churna',
      sku: 'TYR-ASH-001',
      category: catMap['herbal-supplements'],
      brand: trivenBrandId,
      description:
        'Prepared using organically cultivated Nagori Ashwagandha roots. Enhanced with traditional cow-milk bhavana to maximize withanolide absorption. Helps balance cortisol, relieve physical fatigue, and support restful sleep.',
      shortDescription: 'Full-spectrum root extract for stress relief, vitality, and deep rejuvenation.',
      images: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
      ],
      mrp: 649,
      sellingPrice: 499,
      taxRatePercent: 12,
      stock: 85,
      lowStockThreshold: 15,
      dosageForm: 'Churna (Powder)',
      netQuantity: '150g',
      ingredients: [
        {
          name: 'Ashwagandha',
          botanicalName: 'Withania somnifera',
          percentage: '100% Pure Root Extract',
          benefits: 'Soothes Vata dosha, enhances endurance, and eases mental fatigue.',
        },
      ],
      usageInstructions: 'Take 3g to 5g once or twice daily with warm milk or honey, or as prescribed by your Vaidya.',
      warnings: 'Consult an Ayurvedic practitioner if pregnant or taking thyroid medication.',
      storageInstructions: 'Store in an airtight container away from moisture and heat.',
      ayushLicenseNumber: 'AYUSH-UK/L-442/2021',
      batchNumber: 'ASH-2026-B1',
      expiryDate: new Date('2028-12-31'),
      manufacturingDate: new Date('2026-01-15'),
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      status: 'published',
      rating: 4.9,
      numReviews: 24,
      seoTitle: 'Organic Ashwagandha KSM-66 Churna | Pure Ayurvedic Root Extract',
      seoDescription: 'Buy pure organic Ashwagandha powder online. Helps reduce stress, promote deep sleep, and build endurance.',
    },
    {
      name: 'Classical Maha Bhringraj Taila',
      slug: 'classical-maha-bhringraj-taila',
      sku: 'TYR-BHR-002',
      category: catMap['ayurvedic-oils'],
      brand: trivenBrandId,
      description:
        'Slow-cooked over mild wood fire using the sacred Kshirapaka method for 72 hours. Infused with fresh Bhringraj juice, Amla, Brahmi, and Lodhra in cold-pressed black sesame oil. Deeply nourishes hair roots and prevents premature greying.',
      shortDescription: 'Slow-cooked herbal hair elixir with 21 medicinal herbs for thick lustrous hair.',
      images: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
      ],
      mrp: 899,
      sellingPrice: 699,
      taxRatePercent: 12,
      stock: 42,
      lowStockThreshold: 10,
      dosageForm: 'Taila (Oil)',
      netQuantity: '200ml',
      ingredients: [
        {
          name: 'Bhringraj',
          botanicalName: 'Eclipta alba',
          percentage: '35%',
          benefits: 'Keshya herb that stimulates micro-circulation to hair follicles.',
        },
        {
          name: 'Brahmi',
          botanicalName: 'Bacopa monnieri',
          percentage: '20%',
          benefits: 'Cools Pitta dosha and calms scalp stress.',
        },
        {
          name: 'Black Sesame Seed Oil',
          botanicalName: 'Sesamum indicum',
          percentage: 'Base (Cold Pressed)',
          benefits: 'Penetrates deep into the cortex with essential lipids.',
        },
      ],
      usageInstructions: 'Warm gently and massage scalp for 10-15 minutes before bed. Wash off with mild herbal cleanser.',
      warnings: 'For external scalp application only. Avoid direct eye contact.',
      storageInstructions: 'Store in amber glass bottle away from direct sunlight.',
      ayushLicenseNumber: 'AYUSH-UK/L-442/2021',
      batchNumber: 'BHR-2026-V4',
      expiryDate: new Date('2028-06-30'),
      manufacturingDate: new Date('2026-02-01'),
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      status: 'published',
      rating: 4.8,
      numReviews: 19,
      seoTitle: 'Maha Bhringraj Taila 200ml | Classical Hair Oil | Triven Ayurveda',
      seoDescription: 'Authentic Kshirapaka method Maha Bhringraj oil. Revitalizes weak hair roots and promotes restful sleep.',
    },
    {
      name: 'Triphala Gut Detox Vati (Tablets)',
      slug: 'triphala-gut-detox-vati',
      sku: 'TYR-TRP-003',
      category: catMap['digestive-wellness'],
      brand: kottakkalBrandId,
      description:
        'Balanced trinity of Haritaki, Bibhitaki, and Amalaki prepared in standardized tablet form. Gently clears Ama (toxins) without inducing abdominal cramps or dependency. Supports healthy bowel regularity and micro-nutrient absorption.',
      shortDescription: 'Gentle colon cleanse and natural digestion tonic formulated according to Charaka Samhita.',
      images: [
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
      ],
      mrp: 420,
      sellingPrice: 349,
      taxRatePercent: 12,
      stock: 120,
      lowStockThreshold: 20,
      dosageForm: 'Vati/Gutika (Tablet)',
      netQuantity: '60 Tablets (500mg each)',
      ingredients: [
        { name: 'Haritaki', botanicalName: 'Terminalia chebula', percentage: '33.3%', benefits: 'Pacifies Vata; gentle laxative.' },
        { name: 'Bibhitaki', botanicalName: 'Terminalia bellirica', percentage: '33.3%', benefits: 'Pacifies Kapha; breaks mucus congestion.' },
        { name: 'Amalaki', botanicalName: 'Emblica officinalis', percentage: '33.4%', benefits: 'Pacifies Pitta; rich natural antioxidant Vitamin C.' },
      ],
      usageInstructions: 'Take 1 to 2 tablets at bedtime with lukewarm water.',
      warnings: 'Not recommended during acute diarrhea or late-stage pregnancy.',
      storageInstructions: 'Keep lid tightly closed to prevent moisture absorption.',
      ayushLicenseNumber: 'KL-AYU-0012/1902',
      batchNumber: 'TRP-2026-X1',
      expiryDate: new Date('2029-01-31'),
      manufacturingDate: new Date('2026-01-20'),
      isFeatured: false,
      isBestseller: true,
      isNewArrival: false,
      status: 'published',
      rating: 4.9,
      numReviews: 31,
      seoTitle: 'Triphala Vati 60 Tabs | Natural Colon Cleanser & Gut Health',
      seoDescription: 'Authentic classical Triphala tablets for daily digestive wellness, regularity, and antioxidant detox.',
    },
    {
      name: 'Kumkumadi Miraculous Beauty Oil',
      slug: 'kumkumadi-miraculous-beauty-oil',
      sku: 'TYR-KUM-004',
      category: catMap['skin-and-hair'],
      brand: trivenBrandId,
      description:
        'Exquisite blend of 26 rare Himalayan botanicals led by pure Kashmiri Saffron (Kumkuma), Sandalwood, and Indian Madder (Manjistha). Illuminates complexion, lightens hyperpigmentation, and minimizes fine lines.',
      shortDescription: 'Pure Kashmiri Saffron 100% natural facial night oil for luminous, youthful skin.',
      images: [
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
      ],
      mrp: 1499,
      sellingPrice: 1199,
      taxRatePercent: 12,
      stock: 28,
      lowStockThreshold: 10,
      dosageForm: 'Taila (Oil)',
      netQuantity: '30ml with dropper',
      ingredients: [
        { name: 'Kashmiri Saffron', botanicalName: 'Crocus sativus', percentage: 'Premium Grade', benefits: 'Brightens skin texture and adds natural glow.' },
        { name: 'Manjistha', botanicalName: 'Rubia cordifolia', percentage: 'Classical Decoction', benefits: 'Purifies blood and evens skin tone.' },
      ],
      usageInstructions: 'Cleanse face and apply 3-4 drops onto damp skin every night. Massage gently in upward circular motions.',
      warnings: 'For external cosmetic use only. Patch test recommended on sensitive skin.',
      storageInstructions: 'Store in cool place away from harsh light.',
      ayushLicenseNumber: 'AYUSH-UK/L-442/2021',
      batchNumber: 'KUM-2026-09',
      expiryDate: new Date('2028-11-30'),
      manufacturingDate: new Date('2026-02-10'),
      isFeatured: true,
      isBestseller: false,
      isNewArrival: true,
      status: 'published',
      rating: 4.7,
      numReviews: 12,
      seoTitle: 'Kumkumadi Tailam 30ml | Pure Saffron Facial Oil | Triven Ayurveda',
      seoDescription: 'Classical Kumkumadi Ayurvedic beauty oil made with authentic saffron for radiant glowing skin.',
    },
    {
      name: 'Himalayan Shilajit Gold Resin',
      slug: 'himalayan-shilajit-gold-resin',
      sku: 'TYR-SHI-005',
      category: catMap['immunity-rasayana'],
      brand: trivenBrandId,
      description:
        'Sourced at 18,000+ feet in the upper Himalayas. Naturally purified through classical Agnitapi Surya methods with Triphala decoction. Tested for 80+ trace minerals and rich in >75% fulvic acid for maximum cellular energy.',
      shortDescription: 'Pure purified Himalayan grade Shilajit resin with high fulvic acid and gold minerals.',
      images: [
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
      ],
      mrp: 1899,
      sellingPrice: 1449,
      taxRatePercent: 12,
      stock: 18,
      lowStockThreshold: 10,
      dosageForm: 'Avaleha (Paste)',
      netQuantity: '20g',
      ingredients: [
        { name: 'Purified Shilajit', botanicalName: 'Asphaltum punjabianum', percentage: '100% Pure Resin', benefits: 'Powers cellular ATP production and builds Ojas.' },
        { name: 'Swarna Bhasma (Gold)', botanicalName: 'Aurum Metallicum', percentage: 'Trace (Classically Purified)', benefits: 'Supreme immunomodulator.' },
      ],
      usageInstructions: 'Dissolve pea-sized amount (300-500mg) in warm milk or green tea, consumed in the morning.',
      warnings: 'Do not consume with citrus fruits or high-iron medications without medical guidance.',
      storageInstructions: 'Keep in glass jar. May harden in low temperatures; soften by dipping jar in warm water.',
      ayushLicenseNumber: 'AYUSH-UK/L-442/2021',
      batchNumber: 'SHI-2026-P9',
      expiryDate: new Date('2029-12-31'),
      manufacturingDate: new Date('2026-01-05'),
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      status: 'published',
      rating: 5.0,
      numReviews: 38,
      seoTitle: 'Himalayan Shilajit Gold Resin 20g | 75% Fulvic Acid Lab Tested',
      seoDescription: 'Authentic Himalayan Shilajit resin. Boosts physical stamina, stamina, and cellular vitality.',
    },
    {
      name: 'Brahmi Medhya Churna (Memory & Focus)',
      slug: 'brahmi-medhya-churna',
      sku: 'TYR-BRH-006',
      category: catMap['herbal-supplements'],
      brand: kottakkalBrandId,
      description:
        'Celebrated in Ayurvedic texts as Medhya Rasayana (mind rejuvenator). Enhances cognitive sharpness, supports memory retention, and pacifies mental restlessness without sedating side effects.',
      shortDescription: 'Natural brain tonic and neuro-protective herb churna for mental clarity and peaceful sleep.',
      images: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
      ],
      mrp: 399,
      sellingPrice: 320,
      taxRatePercent: 12,
      stock: 6, // Low stock on purpose to test alerts!
      lowStockThreshold: 10,
      dosageForm: 'Churna (Powder)',
      netQuantity: '100g',
      ingredients: [
        { name: 'Brahmi', botanicalName: 'Bacopa monnieri', percentage: '100% Powdered Whole Herb', benefits: 'Soothes Pitta in Sadhaka heart and brain, enhancing recall.' },
      ],
      usageInstructions: 'Take 3g twice daily with organic ghee or warm milk.',
      warnings: 'Store away from humidity. Keep out of reach of young children.',
      storageInstructions: 'Keep airtight in dry dark shelf.',
      ayushLicenseNumber: 'KL-AYU-0012/1902',
      batchNumber: 'BRH-2026-M2',
      expiryDate: new Date('2028-04-30'),
      manufacturingDate: new Date('2026-01-10'),
      isFeatured: false,
      isBestseller: false,
      isNewArrival: true,
      status: 'published',
      rating: 4.7,
      numReviews: 8,
      seoTitle: 'Brahmi Churna 100g | Medhya Rasayana for Focus & Peace',
      seoDescription: 'Pure Bacopa Monnieri Brahmi powder for brain health, concentration, and peaceful nervous system.',
    },
  ];

  await db.collection('products').insertMany(products);

  console.log('Creating Promotional Banners...');
  await db.collection('banners').insertMany([
    {
      title: 'Pure Classical Vedic Formulations',
      subtitle: 'Experience authentic remedies prepared by classical Samhita methods with lab-tested Himalayan botanicals.',
      badge: 'Certified AYUSH Standards',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1600',
      linkUrl: '/products',
      ctaText: 'Discover Pure Remedies',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
    },
    {
      title: '72-Hour Kshirapaka Herbal Tailas',
      subtitle: 'Slow wood-fired oil infusions crafted with cold-pressed sesame and 21 sacred medicinal herbs for scalp and body.',
      badge: 'Handcrafted in Small Batches',
      imageUrl: 'https://images.unsplash.com/photo-1608248597359-54a7c866b8fb?auto=format&fit=crop&q=80&w=1600',
      linkUrl: '/products?category=ayurvedic-oils',
      ctaText: 'Explore Herbal Oils',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
    },
  ]);

  console.log('Creating Discount Coupons...');
  await db.collection('coupons').insertMany([
    {
      code: 'VEDIC15',
      description: '15% Off on all authentic Ayurvedic remedies',
      discountType: 'percentage',
      discountValue: 15,
      minCartValue: 500,
      maxDiscountAmount: 300,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-12-31'),
      usageLimit: 1000,
      usedCount: 14,
      perUserLimit: 2,
      usedBy: [],
      isActive: true,
      createdAt: new Date(),
    },
    {
      code: 'WELCOME100',
      description: 'Flat ₹100 Off for your first holistic order',
      discountType: 'fixed',
      discountValue: 100,
      minCartValue: 699,
      maxDiscountAmount: null,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-12-31'),
      usageLimit: 500,
      usedCount: 5,
      perUserLimit: 1,
      usedBy: [],
      isActive: true,
      createdAt: new Date(),
    },
  ]);

  console.log('Seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log('Default Super Admin credentials:');
  console.log('Email:    admin@trivenayurveda.com');
  console.log('Password: Admin@Ayur2026');
  console.log('--------------------------------------------------');
  console.log('Default Customer credentials:');
  console.log('Email:    ananya@example.com');
  console.log('Password: Customer@123');
  console.log('--------------------------------------------------');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed Error:', err);
  process.exit(1);
});
