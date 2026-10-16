'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, ShieldCheck, Check, Sparkles, Zap, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductImage from './ProductImage';

export default function AmazonDealsRow({ products = [], title = "Today's Deals in Classical Medicines", subtitle = "Authentic AYUSH certified remedies with same-day dispatch" }) {
  const router = useRouter();
  const scrollRef = useRef(null);
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);
  const [orderingId, setOrderingId] = useState(null);

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

  const handleOrderNow = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    setOrderingId(product._id);
    addToCart(product, 1);
    router.push('/checkout');
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-6 sm:my-10">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-4 sm:p-6">
        {/* Header with Title and Scroll Controls */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="font-serif font-bold text-stone-900 text-base sm:text-2xl">
                {title}
              </h2>
              <span className="bg-red-100 text-red-800 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded">
                Limited Time Deals
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/products"
              className="text-xs font-semibold text-stone-900 hover:text-[#8C5E3C] hover:underline mr-1 hidden md:inline-block"
            >
              See all deals
            </Link>

            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-stone-200 bg-stone-50 hover:bg-white text-stone-700 flex items-center justify-center hover:shadow-xs transition-all min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-stone-200 bg-stone-50 hover:bg-white text-stone-700 flex items-center justify-center hover:shadow-xs transition-all min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-1 px-1 touch-scroll snap-x snap-mandatory"
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
                className="w-[155px] xxs:w-[175px] xs:w-[205px] sm:w-[240px] md:w-[260px] shrink-0 snap-start bg-stone-50/50 hover:bg-white rounded-2xl border border-stone-200/90 hover:border-[#C5A059] transition-all p-2.5 sm:p-3 flex flex-col justify-between group hover:shadow-md"
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
                  <Link href={`/products/${product.slug}`} className="block group-hover:text-[#8C5E3C] transition-colors mb-1">
                    <h3 className="text-[11px] sm:text-sm font-medium text-stone-800 line-clamp-2 leading-tight h-7 sm:h-9">
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

                  {/* Amazon Prime Tag */}
                  <div className="text-[10px] sm:text-[11px] flex items-center gap-1 mb-2.5 truncate">
                    <span className="font-bold text-[#C5A059] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#C5A059] shrink-0" />
                      <span>Prime</span>
                    </span>
                    <span className="text-stone-400 text-[10px]">• Express Dispatch</span>
                  </div>
                </div>

                {/* Action Buttons: Order Now (Instant Checkout) + Add to Bag */}
                <div className="space-y-1.5 mt-auto pt-2">
                  {/* Primary Order Now Button */}
                  <button
                    onClick={(e) => handleOrderNow(e, product)}
                    disabled={orderingId === product._id || product.stock <= 0}
                    className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm min-h-[38px] active:scale-98 ${
                      product.stock <= 0
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : orderingId === product._id
                        ? 'bg-[#C5A059] text-[#0F1D36] opacity-90'
                        : 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] hover:brightness-105 text-[#0F1D36] shadow-[0_3px_12px_rgba(212,175,55,0.3)]'
                    }`}
                    aria-label={product.stock <= 0 ? "Out of Stock" : `Order ${product.name} Now`}
                  >
                    {orderingId === product._id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F1D36]" />
                        <span>Proceeding...</span>
                      </>
                    ) : product.stock <= 0 ? (
                      <span>Out of Stock</span>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-[#0F1D36] text-[#0F1D36] shrink-0" />
                        <span>Order Now</span>
                      </>
                    )}
                  </button>

                  {/* Secondary Add to Bag Button */}
                  <button
                    onClick={(e) => handleAdd(e, product)}
                    disabled={isJustAdded || product.stock <= 0}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[32px] ${
                      product.stock <= 0
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        : isJustAdded
                        ? 'bg-[#0F1D36] text-[#C5A059] border border-[#C5A059]'
                        : 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 hover:border-stone-400 active:scale-98'
                    }`}
                    aria-label={product.stock <= 0 ? "Out of Stock" : `Add ${product.name} to Cart`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
