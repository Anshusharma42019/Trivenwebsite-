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

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  await connectDB();

  // Fetch live products for deals and bestsellers
  const [bestsellerData, featuredData] = await Promise.all([
    getProducts({ limit: 8, bestseller: true }),
    getProducts({ limit: 8, featured: true }),
  ]);

  const bestsellerProducts = bestsellerData?.products || [];
  const featuredProducts = featuredData?.products || [];

  // Combine products for deals carousel
  const dealProducts = [...featuredProducts, ...bestsellerProducts].filter(
    (p, idx, self) => self.findIndex((item) => item._id === p._id) === idx
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-800 antialiased selection:bg-[#D4AF37]/30 selection:text-[#1B4332]">
      {/* 1. Amazon-Style Navigation Bar with Delivery Location & Search Category Dropdown */}
      <Navbar />

      <main className="flex-1 pb-12">
        {/* 2. Amazon-Style Hero Carousel with Soft Bottom Gradient Fade */}
        <AmazonHeroCarousel />

        {/* 3. Amazon Signature 4-Quadrant Card Multi-Grid Overlapping Hero */}
        <AmazonMultiCardGrid />

        {/* 4. Horizontal Scrolling 'Today's Deals' Slider */}
        <AmazonDealsRow
          products={dealProducts.length > 0 ? dealProducts : bestsellerProducts}
          title="Today's Deals in Classical Medicines"
          subtitle="Time-tested formulations with limited-time festival discounts & fast delivery"
        />

        {/* 5. Amazon-Style Circular 'Shop by Ayurvedic Health Need' Category Showcase */}
        <AmazonCategoryPills />

        {/* 6. Amazon-Style Vedic Prime & Festival Promotional Strip */}
        <AmazonPrimeBanner />

        {/* 7. 'Best Sellers in Ayurvedic Formulations' Grid with #1, #2 Rank Badges */}
        <AmazonBestSellersGrid products={bestsellerProducts.slice(0, 4)} />

        {/* 8. Secondary Amazon 4-Column Feature Grid (Hair Care, Gut, Kashmiri Saffron, Stress) */}
        <AmazonFourColumnGrid2 />

        {/* 9. Amazon-Style Trust & Laboratory Certification Strip */}
        <AmazonTrustStrip />
      </main>

      {/* 10. Amazon-Style Multi-Tiered Footer with Back-to-Top and Statutory Disclosures */}
      <Footer />
    </div>
  );
}
