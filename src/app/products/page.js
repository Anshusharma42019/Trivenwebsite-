import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import ProductFiltersDrawer from '@/components/store/ProductFiltersDrawer';
import { getProducts } from '@/services/productService';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import {
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  if (params.bestseller === 'true') {
    return {
      title: 'Best Sellers in Ayurvedic Medicine | Triven Ayurveda',
      description: 'Our most popular classical remedies and top-rated formulations based on verified purchases.',
    };
  }
  if (params.search) {
    return {
      title: `Search results for "${params.search}" | Triven Ayurveda`,
      description: `Shop authentic Ayurvedic formulations matching ${params.search}.`,
    };
  }
  if (params.category) {
    return {
      title: `${params.category.replace('-', ' ').toUpperCase()} | Triven Ayurveda`,
      description: `Explore classical remedies in ${params.category}.`,
    };
  }
  return {
    title: 'Classical Ayurvedic Formulations & Bestsellers | Triven Ayurveda',
    description: 'Explore classical Ayurvedic single herbs, hair oils, digestive wellness churnas, and vitality rasayanas.',
  };
}

export default async function ProductsPage({ searchParams }) {
  await connectDB();
  const params = await searchParams;

  const page = parseInt(params.page || '1', 10);
  const category = params.category || null;
  const brand = params.brand || null;
  const search = params.search || null;
  const sort = params.sort || 'newest';
  const minPrice = params.minPrice || null;
  const maxPrice = params.maxPrice || null;
  const bestseller = params.bestseller === 'true';
  const featured = params.featured === 'true';

  const [productsData, rawCategories, rawBrands] = await Promise.all([
    getProducts({
      page,
      limit: 16,
      category,
      brand,
      search,
      sort,
      minPrice,
      maxPrice,
      bestseller,
      featured,
    }),
    Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
    Brand.find({ isActive: true }).sort({ name: 1 }).lean(),
  ]);

  const products = productsData?.products || [];
  const total = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 1;
  const categories = rawCategories ? JSON.parse(JSON.stringify(rawCategories)) : [];
  const brands = rawBrands ? JSON.parse(JSON.stringify(rawBrands)) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2523]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full">
        {/* Amazon-Style Header Results Bar */}
        <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 mb-4 sm:mb-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1 flex-wrap">
                <Link href="/" className="hover:text-[#C5A059] hover:underline">
                  Home
                </Link>
                <span>›</span>
                <Link href="/products" className="hover:text-[#C5A059] hover:underline">
                  Ayurvedic Medicines
                </Link>
                {category && (
                  <>
                    <span>›</span>
                    <span className="text-stone-800 font-semibold capitalize">
                      {category.replace('-', ' ')}
                    </span>
                  </>
                )}
                {bestseller && (
                  <>
                    <span>›</span>
                    <span className="text-stone-800 font-semibold">
                      Best Sellers
                    </span>
                  </>
                )}
              </div>

              {/* Result Count Title */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-stone-600 font-normal">
                  Showing <strong className="text-stone-900">1-{products.length}</strong> of{' '}
                  <strong className="text-stone-900">{total}</strong> results
                </span>
                {search && (
                  <span className="text-xs sm:text-sm text-stone-900 font-bold">
                    for <span className="text-red-700 font-serif">"{search}"</span>
                  </span>
                )}
                {bestseller && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 px-3 py-0.5 rounded-full font-bold shadow-xs">
                    <span>✦ Triven #1 Best Sellers</span>
                  </span>
                )}
              </div>
            </div>

            {/* Amazon-Style Sort Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 self-start md:self-auto w-full md:w-auto">
              <label htmlFor="sort-select" className="text-xs text-stone-600 font-medium shrink-0">
                Sort by:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll pb-1 sm:pb-0 w-full sm:w-auto">
                {[
                  { label: 'Featured', value: 'newest' },
                  { label: 'Reviews', value: 'rating' },
                  { label: 'Price: Low-High', value: 'price_asc' },
                  { label: 'Price: High-Low', value: 'price_desc' },
                  { label: 'Best Sellers', value: 'bestseller' },
                ].map((s) => (
                  <Link
                    key={s.value}
                    href={`/products?${new URLSearchParams({ ...params, sort: s.value }).toString()}`}
                    className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap shrink-0 transition-all ${
                      sort === s.value
                        ? 'bg-[#18181B] text-[#C5A059] border-[#C5A059] shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Catalog Layout: Left Filter Sidebar / Mobile Drawer + Right Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Responsive Filters: Mobile Drawer (<lg) and Desktop Persistent Sidebar (lg:block) */}
          <ProductFiltersDrawer
            categories={categories}
            brands={brands}
            currentCategory={category}
            currentBrand={brand}
            currentSort={sort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            bestseller={bestseller}
            search={search}
            totalResults={total}
          />

          {/* Right Results Column */}
          <div className="lg:col-span-3 space-y-6 min-w-0">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EBE6DD] p-8 sm:p-12 text-center shadow-luxury">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 border border-amber-200/60 mx-auto flex items-center justify-center mb-4 shadow-sm">
                  <Sparkles className="w-7 h-7 text-[#C5A059]" />
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#14171F]">
                  No matching classical formulations found
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Try clearing your filters or search for another herb like Ashwagandha, Triphala, or Bhringraj.
                </p>
                <Link
                  href="/products"
                  className="mt-4 inline-block bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold px-6 py-2.5 rounded-xl transition-all min-h-[44px] leading-[44px] shadow-sm"
                >
                  View All Formulations
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5">
                {products.map((p, idx) => (
                  <div key={p._id.toString()} className="relative min-w-0">
                    {/* Amazon-style 'Overall Pick' / 'Best Seller' Tag on First items */}
                    {idx === 0 && (
                      <div className="absolute top-2.5 left-2.5 z-20 bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs tracking-wider">
                        ✦ Overall Pick
                      </div>
                    )}
                    {idx === 1 && p.isBestseller && (
                      <div className="absolute top-2.5 left-2.5 z-20 bg-[#D4AF37] text-[#0F1D36] text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs tracking-wider">
                        ★ #1 Best Seller
                      </div>
                    )}
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}

            {/* Amazon-Style Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-stone-200 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/products?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all min-h-[40px] min-w-[40px] ${
                      p === page
                        ? 'bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37] shadow-sm'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
