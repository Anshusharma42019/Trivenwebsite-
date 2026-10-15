'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

export default function AmazonBestSellersGrid({ products = [] }) {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-8 sm:my-12">
      <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(15,29,54,0.05)] border border-[#C5A059]/25 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
                ✦ Ranked #1
              </span>
              <h2 className="font-serif font-bold text-stone-900 text-lg sm:text-2xl">
                Best Sellers in Ayurvedic Formulations
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Our most popular classical remedies, updated hourly based on Vaidya prescriptions and sales
            </p>
          </div>

          <Link
            href="/products?bestseller=true"
            className="text-xs font-semibold text-[#8C5E3C] hover:text-[#0F1D36] hover:underline self-start sm:self-auto min-h-[32px] flex items-center gap-1"
          >
            <span>See more Best Sellers</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {products.map((product, idx) => (
            <div key={product._id} className="relative min-w-0">
              {/* Rank Ribbon */}
              <div className="absolute -top-2.5 -left-2.5 z-20 bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/60 text-[10px] sm:text-xs font-extrabold w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md">
                #{idx + 1}
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
