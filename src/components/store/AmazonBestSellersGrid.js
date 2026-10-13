'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

export default function AmazonBestSellersGrid({ products = [] }) {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-6 sm:my-10">
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#D4AF37] text-[#1B4332] text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                Ranked #1
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
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline self-start sm:self-auto min-h-[32px] flex items-center"
          >
            See more Best Sellers →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product, idx) => (
            <div key={product._id} className="relative min-w-0">
              {/* Amazon Rank Ribbon */}
              <div className="absolute -top-2 -left-2 z-10 bg-[#1B4332] text-[#D4AF37] border border-[#D4AF37]/50 text-[10px] sm:text-xs font-extrabold w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md">
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
