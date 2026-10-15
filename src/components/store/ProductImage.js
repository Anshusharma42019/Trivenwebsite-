'use client';

import React, { useState } from 'react';
import { Package, Sparkles } from 'lucide-react';

/**
 * Reusable product image component.
 * Displays admin-uploaded image if present, or an elegant branded placeholder
 * if no image has been uploaded yet. Never falls back to fake stock images.
 */
export default function ProductImage({
  src,
  alt = 'Ayurvedic Medicine',
  className = 'w-full h-full object-cover',
  containerClassName = '',
  loading = 'lazy',
}) {
  const [imgError, setImgError] = useState(false);

  // If no image uploaded or image failed to load, display branded Ayurvedic placeholder
  if (!src || imgError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-stone-100/90 text-stone-400 p-3 select-none text-center ${containerClassName}`}
      >
        <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-[#C5A059]/30 flex items-center justify-center text-[#8C5E3C] mb-1.5 shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
        </div>
        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider leading-tight">
          Triven Pure
        </span>
        <span className="text-[9px] text-stone-400 mt-0.5">Image Pending</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className={className}
      loading={loading}
    />
  );
}
