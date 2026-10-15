'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductImage from './ProductImage';

export default function AmazonFourColumnGrid2({ products = [] }) {
  if (!products || products.length === 0) {
    return null;
  }

  // Pick up to 4 real products from the admin-uploaded catalog
  const featured = products.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-8 sm:my-12">
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {featured.map((product, idx) => {
          const discountPercent =
            product.mrp > product.sellingPrice
              ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
              : 0;

          return (
            <div
              key={product._id || idx}
              className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg leading-tight mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-stone-500 mb-3 line-clamp-1">
                  {product.dosageForm || 'Classical Ayurvedic Medicine'}
                </p>

                <Link href={`/products/${product.slug}`} className="block group mb-3">
                  <div className="aspect-4/3 bg-stone-50 rounded-lg overflow-hidden border border-stone-200 mb-2">
                    <ProductImage
                      src={product.images && product.images[0] ? product.images[0] : null}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-xs font-semibold text-stone-900 group-hover:text-[#8C5E3C] line-clamp-2">
                    {product.name} ({product.netQuantity || 'Standard Pack'})
                  </p>
                  <div className="flex items-center gap-1.5 text-xs mt-1">
                    <span className="font-bold text-stone-900">₹{product.sellingPrice}</span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-stone-400 line-through">₹{product.mrp}</span>
                    )}
                    {discountPercent > 0 && (
                      <span className="text-red-700 font-bold text-[11px]">{discountPercent}% off</span>
                    )}
                  </div>
                </Link>
              </div>

              <Link
                href={`/products/${product.slug}`}
                className="text-xs font-semibold text-stone-900 hover:text-[#8C5E3C] hover:underline flex items-center gap-1 pt-2 border-t border-stone-100"
              >
                <span>View formulation details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
