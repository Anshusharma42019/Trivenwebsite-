'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Star, ShoppingBag, Check, ShieldCheck, Sparkles, Heart } from 'lucide-react';

import ProductImage from './ProductImage';

export default function ProductCard({ product, rank = null, badge = null }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  const discountPercent =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const isFavorited = isInWishlist(product._id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200/90 hover:border-[#C5A059]/50 hover:shadow-[0_15px_35px_rgba(15,29,54,0.08)] transition-all duration-300 flex flex-col overflow-hidden p-2.5 sm:p-4 min-w-0">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-stone-50 rounded-lg overflow-hidden mb-2 sm:mb-3">
        <ProductImage
          src={product.images && product.images[0] ? product.images[0] : null}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Rank Ribbon */}
        {rank && (
          <div className="absolute top-2 left-2 z-10 bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/60 text-[10px] sm:text-xs font-extrabold w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center shadow-md">
            #{rank}
          </div>
        )}

        {/* Special Custom Badge */}
        {badge && !rank && (
          <span className="absolute top-2 left-2 z-10 bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs tracking-wider">
            {badge}
          </span>
        )}

        {/* Wishlist Heart Button (Amazon Style) */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 z-10 w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
            isFavorited
              ? 'bg-red-50 text-red-600'
              : 'bg-white/80 hover:bg-white text-stone-400 hover:text-red-600'
          }`}
          aria-label={isFavorited ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Discount Pill */}
        {discountPercent > 0 && (
          <span
            className={`absolute z-10 bg-red-700 text-white text-[9.5px] sm:text-[10.5px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
              rank ? 'top-2.5 left-10.5' : badge ? 'top-7.5 left-2' : 'top-2 left-2'
            }`}
          >
            {discountPercent}% off
          </span>
        )}

        {/* Dosage Form Tag */}
        <span className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 bg-white/95 backdrop-blur-md text-[#8C5E3C] text-[8.5px] sm:text-[10px] font-bold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full border border-[#C5A059]/30 shadow-2xs truncate max-w-[80%]">
          {product.dosageForm || 'Classical'}
        </span>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Title */}
        <Link href={`/products/${product.slug}`} className="block group-hover:text-[#8C5E3C] transition-colors mb-1.5">
          <h3 className="font-serif font-bold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[11px] text-stone-400 font-sans mt-0.5 truncate">
            {product.netQuantity || 'Authentic Formulation'}
          </p>
        </Link>

        {/* Ratings and Reviews */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-600 mb-1">
          <div className="flex items-center text-amber-500 font-semibold gap-0.5">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            <span>{product.rating || 4.8}</span>
          </div>
          <span className="text-stone-400 text-[10px] sm:text-xs">({product.numReviews || 24})</span>
        </div>

        {/* Amazon Social Proof Tag */}
        <div className="text-[10px] sm:text-[11px] text-stone-500 mb-2 truncate">
          <span>500+ bought in past month</span>
        </div>

        {/* Amazon Price Box */}
        <div className="mt-auto pt-2 border-t border-stone-100">
          <div className="flex items-baseline flex-wrap gap-1 sm:gap-1.5 mb-1">
            <span className="text-sm xxs:text-base sm:text-lg md:text-xl font-bold text-stone-900">
              ₹{product.sellingPrice}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                M.R.P: ₹{product.mrp}
              </span>
            )}
          </div>

          {/* Prime Tag */}
          <div className="text-[9.5px] sm:text-[11px] flex items-center gap-1 mb-2.5 sm:mb-3 truncate">
            <span className="font-bold text-[#C5A059] flex items-center gap-0.5">
              <span>✦</span> Triven Prime
            </span>
            <span className="text-stone-400 text-[9.5px] sm:text-[10px]">• AYUSH Certified</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock || added}
            className={`w-full py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[38px] sm:min-h-[44px] ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : added
                ? 'bg-[#0F1D36] text-[#C5A059] border border-[#C5A059]'
                : 'bg-[#0F1D36] hover:bg-[#162238] text-[#C5A059] border border-[#C5A059]/40 hover:border-[#C5A059] active:scale-98 shadow-sm'
            }`}
            aria-label={isOutOfStock ? "Out of Stock" : `Add ${product.name} to Cart`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : added ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
