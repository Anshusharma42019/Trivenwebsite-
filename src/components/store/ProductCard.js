'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Star, ShoppingBag, Check, ShieldCheck, Sparkles, Heart } from 'lucide-react';

export default function ProductCard({ product }) {
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
    <div className="group relative bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden p-2.5 sm:p-3.5 min-w-0">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-stone-50 rounded-lg overflow-hidden mb-2.5 sm:mb-3">
        <img
          src={
            product.images && product.images[0]
              ? product.images[0]
              : 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600'
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Wishlist Heart Button (Amazon Style) */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
            isFavorited
              ? 'bg-red-50 text-red-600'
              : 'bg-white/80 hover:bg-white text-stone-400 hover:text-red-600'
          }`}
          aria-label={isFavorited ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Discount Pill */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-700 text-white text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded shadow-xs">
            {discountPercent}% off
          </span>
        )}

        {/* Dosage Form Tag */}
        <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-stone-700 text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded border border-stone-200 shadow-2xs truncate max-w-[80%]">
          {product.dosageForm || 'Classical'}
        </span>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Title */}
        <Link href={`/products/${product.slug}`} className="block group-hover:text-[#1B4332] transition-colors mb-1">
          <h3 className="font-sans font-medium text-stone-900 text-xs sm:text-sm leading-snug line-clamp-2">
            {product.name} ({product.netQuantity || 'Standard Pack'})
          </h3>
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
            <span className="text-base sm:text-lg md:text-xl font-bold text-stone-900">
              ₹{product.sellingPrice}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                M.R.P: ₹{product.mrp}
              </span>
            )}
          </div>

          {/* Prime Tag */}
          <div className="text-[10px] sm:text-[11px] text-stone-600 flex items-center gap-1 mb-2.5 truncate">
            <span className="font-bold text-[#1B4332]">✓ Triven Prime</span>
            <span className="hidden xs:inline">• Fast Delivery</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock || added}
            className={`w-full py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs min-h-[40px] sm:min-h-[44px] ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-700 text-white'
                : 'bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] active:scale-95'
            }`}
            aria-label={isOutOfStock ? "Out of Stock" : `Add ${product.name} to Cart`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
