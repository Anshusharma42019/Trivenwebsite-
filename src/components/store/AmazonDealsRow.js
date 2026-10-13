'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductImage from './ProductImage';

export default function AmazonDealsRow({ products = [], title = "Today's Deals in Classical Medicines", subtitle = "Authentic AYUSH certified remedies with same-day dispatch" }) {
  const scrollRef = useRef(null);
  const { addToCart } = useCart();
  const [addedId, setAddedId] = React.useState(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-5 sm:p-6">
        {/* Header with Title and Scroll Controls */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="font-serif font-bold text-stone-900 text-lg sm:text-2xl">
                {title}
              </h2>
              <span className="bg-red-100 text-red-800 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded">
                Limited Time Deals
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/products"
              className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline mr-1 hidden md:inline-block"
            >
              See all deals
            </Link>

            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-200 bg-stone-50 hover:bg-white text-stone-700 flex items-center justify-center hover:shadow-xs transition-all min-w-[36px] min-h-[36px]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-200 bg-stone-50 hover:bg-white text-stone-700 flex items-center justify-center hover:shadow-xs transition-all min-w-[36px] min-h-[36px]"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-1 px-1 touch-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => {
            const discountPercent =
              product.mrp > product.sellingPrice
                ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
                : 0;

            const isJustAdded = addedId === product._id;

            return (
              <div
                key={product._id}
                className="w-[175px] xs:w-[210px] sm:w-[240px] md:w-[260px] shrink-0 bg-stone-50/50 hover:bg-white rounded-xl border border-stone-200 hover:border-emerald-300 transition-all p-2.5 sm:p-3 flex flex-col justify-between group hover:shadow-md"
              >
                <div>
                  {/* Thumbnail */}
                  <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-white rounded-lg overflow-hidden border border-stone-100 mb-2">
                    <ProductImage
                      src={product.images && product.images[0] ? product.images[0] : null}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />

                    {discountPercent > 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-red-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        {discountPercent}% off
                      </span>
                    )}

                    <span className="absolute bottom-1.5 right-1.5 bg-white/90 backdrop-blur-xs text-[9px] sm:text-[10px] font-medium text-stone-600 px-1.5 py-0.5 rounded border border-stone-200 truncate max-w-[80%]">
                      {product.dosageForm || 'Classical'}
                    </span>
                  </Link>

                  {/* Pricing Amazon Style */}
                  <div className="flex items-baseline flex-wrap gap-1 mb-1">
                    <span className="text-base sm:text-lg font-bold text-stone-900">
                      ₹{product.sellingPrice}
                    </span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={`/products/${product.slug}`} className="block group-hover:text-[#1B4332] transition-colors mb-1">
                    <h3 className="text-xs sm:text-sm font-medium text-stone-800 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Ratings */}
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 mb-1.5">
                    <div className="flex items-center text-amber-500 font-semibold gap-0.5">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{product.rating || 4.8}</span>
                    </div>
                    <span>({product.numReviews || 18})</span>
                  </div>

                  {/* Amazon Prime / Pan-India Delivery Tag */}
                  <div className="text-[10px] sm:text-[11px] text-stone-600 flex items-center gap-1 mb-2.5 truncate">
                    <span className="font-bold text-[#1B4332]">✓ Prime</span>
                    <span className="hidden xxs:inline">• Fast Delivery</span>
                  </div>
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={(e) => handleAdd(e, product)}
                  disabled={isJustAdded || product.stock <= 0}
                  className={`w-full py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs min-h-[38px] sm:min-h-[42px] ${
                    product.stock <= 0
                      ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                      : isJustAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] active:scale-95'
                  }`}
                  aria-label={product.stock <= 0 ? "Out of Stock" : `Add ${product.name} to Cart`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : product.stock <= 0 ? (
                    <span>Out of Stock</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
