import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import AmazonHeroCarousel from '@/components/store/AmazonHeroCarousel';
import AmazonMultiCardGrid from '@/components/store/AmazonMultiCardGrid';
import AmazonDealsRow from '@/components/store/AmazonDealsRow';
import AmazonCategoryPills from '@/components/store/AmazonCategoryPills';
import AmazonPrimeBanner from '@/components/store/AmazonPrimeBanner';
import AmazonBestSellersGrid from '@/components/store/AmazonBestSellersGrid';
import AmazonFourColumnGrid2 from '@/components/store/AmazonFourColumnGrid2';
import AmazonTrustStrip from '@/components/store/AmazonTrustStrip';
import { getProducts } from '@/services/productService';
import { connectDB } from '@/lib/mongodb';

import Category from '@/models/Category';

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  await connectDB();

  // Fetch live products for deals, bestsellers, and real categories
  const [bestsellerData, featuredData, rawCategories] = await Promise.all([
    getProducts({ limit: 8, bestseller: true }),
    getProducts({ limit: 8, featured: true }),
    Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
  ]);

  const bestsellerProducts = bestsellerData?.products || [];
  const featuredProducts = featuredData?.products || [];
  const categories = rawCategories ? JSON.parse(JSON.stringify(rawCategories)) : [];

  // Combine products for deals carousel
  const dealProducts = [...featuredProducts, ...bestsellerProducts].filter(
    (p, idx, self) => self.findIndex((item) => item._id === p._id) === idx
  );

  const displayProducts = dealProducts.length > 0 ? dealProducts : bestsellerProducts;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2523] antialiased selection:bg-[#C5A059]/25 selection:text-[#0F1D36]">
      {/* 1. Amazon-Style Navigation Bar with Delivery Location & Search Category Dropdown */}
      <Navbar />

      <main className="flex-1 pb-12">
        {/* 2. Amazon-Style Hero Carousel with Soft Bottom Gradient Fade */}
        <AmazonHeroCarousel />

        {/* 3. Amazon Signature 4-Quadrant Card Multi-Grid Overlapping Hero */}
        <AmazonMultiCardGrid products={displayProducts} />

        {/* 4. Horizontal Scrolling 'Today's Deals' Slider */}
        <AmazonDealsRow
          products={displayProducts}
          title="Today's Deals in Classical Medicines"
          subtitle="Time-tested formulations with limited-time festival discounts & fast delivery"
        />

        {/* 5. Amazon-Style Circular 'Shop by Ayurvedic Health Need' Category Showcase */}
        <AmazonCategoryPills categories={categories} />

        {/* 6. Amazon-Style Vedic Prime & Festival Promotional Strip */}
        <AmazonPrimeBanner />

        {/* 7. 'Best Sellers in Ayurvedic Formulations' Grid with #1, #2 Rank Badges */}
        <AmazonBestSellersGrid products={bestsellerProducts.slice(0, 4)} />

        {/* 8. Secondary Amazon 4-Column Feature Grid */}
        <AmazonFourColumnGrid2 products={bestsellerProducts} />

        {/* 9. Amazon-Style Trust & Laboratory Certification Strip */}
        <AmazonTrustStrip />
      </main>

      {/* 10. Amazon-Style Multi-Tiered Footer with Back-to-Top and Statutory Disclosures */}
      <Footer />
    </div>
  );
}
