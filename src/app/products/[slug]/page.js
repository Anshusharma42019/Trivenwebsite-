import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import ProductDetailClient from './ProductDetailClient';
import { getProductBySlug, getProducts } from '@/services/productService';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | Triven Ayurveda' };
  }

  return {
    title: `${product.name} | Triven Ayurveda`,
    description: product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images && product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  await connectDB();

  // Fetch reviews & related products in category
  const [rawReviews, relatedData] = await Promise.all([
    Review.find({ product: product._id, status: 'approved' }).sort({ createdAt: -1 }).limit(10).lean(),
    getProducts({ limit: 4, category: product.category?._id?.toString() || null }),
  ]);

  const reviews = rawReviews ? JSON.parse(JSON.stringify(rawReviews)) : [];
  const relatedProducts = relatedData?.products || [];
  const filteredRelated = relatedProducts.filter((p) => String(p._id) !== String(product._id)).slice(0, 3);

  // Structured Data Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images || [],
    description: product.shortDescription || product.description,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.sellingPrice,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 4.8,
      reviewCount: product.numReviews || 1,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-stone-800">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-stone-800">
            Medicines
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-stone-800">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-stone-800 font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* Client Product View (Interactive Gallery, Add to Cart, Quantity, Review Form) */}
        <ProductDetailClient product={product} initialReviews={reviews} />

        {/* Related Products in this category */}
        {filteredRelated.length > 0 && (
          <div className="mt-20 pt-12 border-t border-stone-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#2D6A4F]">
                  Complementary Remedies
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                  You May Also Need
                </h3>
              </div>
              <Link href="/products" className="text-xs font-semibold text-[#1B4332] hover:underline">
                View all formulations →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRelated.map((p) => (
                <ProductCard key={p._id.toString()} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
