'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Filter,
  X,
  Star,
  Sparkles,
  SlidersHorizontal,
  Check,
  ChevronDown,
} from 'lucide-react';
import { AYURVEDIC_DOSAGE_FORMS } from '@/lib/constants';

export default function ProductFiltersDrawer({
  categories = [],
  brands = [],
  currentCategory,
  currentBrand,
  currentSort = 'newest',
  minPrice,
  maxPrice,
  bestseller,
  search,
  totalResults = 0,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Close drawer on Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Count active filters
  let activeFilterCount = 0;
  if (currentCategory) activeFilterCount++;
  if (currentBrand) activeFilterCount++;
  if (minPrice || maxPrice) activeFilterCount++;
  if (bestseller) activeFilterCount++;

  const buildUrl = (updates = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (currentSort && currentSort !== 'newest') params.set('sort', currentSort);
    if (currentCategory) params.set('category', currentCategory);
    if (currentBrand) params.set('brand', currentBrand);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bestseller) params.set('bestseller', 'true');

    // Apply updates
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    const query = params.toString();
    return `/products${query ? `?${query}` : ''}`;
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Triven Prime Filter */}
      <div className="pb-4 border-b border-stone-100">
        <h4 className="font-serif font-bold text-sm text-stone-900 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <span>Triven Prime</span>
        </h4>
        <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer hover:text-[#8C5E3C]">
          <input type="checkbox" defaultChecked className="rounded text-[#18181B] focus:ring-0" />
          <span className="font-bold text-[#C5A059] inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
            <span>Triven Prime</span>
          </span>
          <span className="text-[11px] text-stone-500">• 1-Day Delivery</span>
        </label>
      </div>

      {/* Customer Review Filter */}
      <div className="pb-4 border-b border-stone-100">
        <h4 className="font-serif font-bold text-sm text-stone-900 mb-2">
          Customer Reviews
        </h4>
        <div className="space-y-1.5 text-xs">
          {[4, 3, 2, 1].map((stars) => (
            <Link
              key={stars}
              href={buildUrl({ sort: 'rating' })}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 text-stone-700 hover:text-amber-700 group py-1 min-h-[36px]"
            >
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < stars ? 'fill-current text-amber-500' : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-stone-600 group-hover:underline">& Up</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Department / Categories */}
      <div className="pb-4 border-b border-[#EBE6DD]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-serif font-bold text-sm text-[#14171F]">
            Category
          </h4>
          {currentCategory && (
            <Link
              href={buildUrl({ category: null })}
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#C5A059] font-bold hover:underline"
            >
              Clear
            </Link>
          )}
        </div>

        <div className="space-y-1 text-xs max-h-60 overflow-y-auto touch-scroll pr-1">
          <Link
            href={buildUrl({ category: null })}
            onClick={() => setIsOpen(false)}
            className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
              !currentCategory
                ? 'font-bold text-[#0F1D36] bg-[#0F1D36]/5 border-l-2 border-[#D4AF37]'
                : 'text-[#6E6761] hover:text-[#0F1D36] hover:bg-stone-50'
            }`}
          >
            All Classical Formulations
          </Link>
          {categories.map((c) => (
            <Link
              key={c._id?.toString() || c.slug}
              href={buildUrl({ category: c.slug })}
              onClick={() => setIsOpen(false)}
              className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
                currentCategory === c.slug
                  ? 'font-bold text-[#0F1D36] bg-[#0F1D36]/5 border-l-2 border-[#D4AF37]'
                  : 'text-[#6E6761] hover:text-[#0F1D36] hover:bg-stone-50'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Price Filter Presets */}
      <div className="pb-4 border-b border-[#EBE6DD]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-serif font-bold text-sm text-[#14171F]">
            Price
          </h4>
          {(minPrice || maxPrice) && (
            <Link
              href={buildUrl({ minPrice: null, maxPrice: null })}
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#C5A059] font-bold hover:underline"
            >
              Clear
            </Link>
          )}
        </div>
        <div className="space-y-1 text-xs text-[#6E6761]">
          <Link
            href={buildUrl({ minPrice: null, maxPrice: '400' })}
            onClick={() => setIsOpen(false)}
            className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
              maxPrice === '400' && !minPrice
                ? 'font-bold text-[#0F1D36] bg-[#0F1D36]/5 border-l-2 border-[#D4AF37]'
                : 'hover:text-[#0F1D36] hover:bg-stone-50'
            }`}
          >
            Under ₹400
          </Link>
          <Link
            href={buildUrl({ minPrice: '400', maxPrice: '800' })}
            onClick={() => setIsOpen(false)}
            className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
              minPrice === '400' && maxPrice === '800'
                ? 'font-bold text-[#0F1D36] bg-[#0F1D36]/5 border-l-2 border-[#D4AF37]'
                : 'hover:text-[#0F1D36] hover:bg-stone-50'
            }`}
          >
            ₹400 - ₹800
          </Link>
          <Link
            href={buildUrl({ minPrice: '800', maxPrice: '1500' })}
            onClick={() => setIsOpen(false)}
            className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
              minPrice === '800' && maxPrice === '1500'
                ? 'font-bold text-[#0F1D36] bg-[#0F1D36]/5 border-l-2 border-[#D4AF37]'
                : 'hover:text-[#0F1D36] hover:bg-stone-50'
            }`}
          >
            ₹800 - ₹1,500
          </Link>
          <Link
            href={buildUrl({ minPrice: '1500', maxPrice: null })}
            onClick={() => setIsOpen(false)}
            className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
              minPrice === '1500' && !maxPrice
                ? 'font-bold text-[#0F1D36] bg-[#0F1D36]/5 border-l-2 border-[#D4AF37]'
                : 'hover:text-[#0F1D36] hover:bg-stone-50'
            }`}
          >
            Over ₹1,500
          </Link>
        </div>
      </div>

      {/* Brands & Vaidyashalas */}
      <div className="pb-4 border-b border-[#EBE6DD]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-serif font-bold text-sm text-[#14171F]">
            Brands & Vaidyashalas
          </h4>
          {currentBrand && (
            <Link
              href={buildUrl({ brand: null })}
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#C5A059] font-bold hover:underline"
            >
              Clear
            </Link>
          )}
        </div>
        <div className="space-y-1.5 text-xs text-[#6E6761] max-h-52 overflow-y-auto touch-scroll pr-1">
          {brands.map((b) => {
            const isSelected = currentBrand === b.slug;
            return (
              <Link
                key={b._id?.toString() || b.slug}
                href={buildUrl({ brand: isSelected ? null : b.slug })}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 py-1 px-1 rounded transition-colors ${
                  isSelected ? 'font-bold text-[#0F1D36] bg-[#0F1D36]/5' : 'hover:text-[#0F1D36]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="rounded text-[#0F1D36] focus:ring-0"
                />
                <span>{b.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dosage Forms */}
      <div className="pb-4 border-b border-[#EBE6DD]">
        <h4 className="font-serif font-bold text-sm text-[#14171F] mb-2">
          Dosage Form
        </h4>
        <div className="space-y-1 text-xs text-[#6E6761] max-h-48 overflow-y-auto pr-1">
          {AYURVEDIC_DOSAGE_FORMS.map((df) => (
            <label key={df} className="flex items-center gap-2 cursor-pointer hover:text-[#0F1D36] py-0.5">
              <input type="checkbox" defaultChecked className="rounded text-[#0F1D36]" />
              <span>{df}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile / Tablet Filter Trigger Button Bar (<lg) */}
      <div className="lg:hidden flex items-center justify-between gap-2 bg-white rounded-xl border border-[#EBE6DD] p-2.5 mb-4 shadow-xs">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-[#FAF8F5] border border-stone-300 text-[#14171F] text-xs font-semibold py-2.5 px-3 rounded-lg min-h-[44px] transition-colors"
          aria-label="Open Filters"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#0F1D36]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#0F1D36] text-[#D4AF37] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#D4AF37]/30">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <Link
            href="/products"
            className="text-xs font-medium text-[#6E6761] hover:text-red-700 px-3 py-2.5 min-h-[44px] flex items-center"
          >
            Clear All
          </Link>
        )}
      </div>

      {/* Desktop Persistent Left Sidebar (lg:block) */}
      <aside className="hidden lg:block lg:col-span-1 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EBE6DD] shadow-luxury">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EBE6DD]">
            <h3 className="font-serif font-bold text-[#14171F] text-sm flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#0F1D36]" />
              <span>Filters</span>
            </h3>
            {activeFilterCount > 0 && (
              <Link
                href="/products"
                className="text-xs text-[#C5A059] font-bold hover:underline"
              >
                Clear all ({activeFilterCount})
              </Link>
            )}
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile Filter Slide-Over Drawer Modal (<lg) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#EBE6DD] bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#0F1D36]" />
                <h3 className="font-serif font-bold text-base text-[#14171F]">
                  Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-stone-500 hover:text-[#14171F] hover:bg-stone-200/60 transition-colors"
                aria-label="Close Filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto touch-scroll p-4">
              {filterContent}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#EBE6DD] bg-white flex items-center gap-3">
              {activeFilterCount > 0 ? (
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center py-2.5 px-3 border border-stone-300 text-[#14171F] rounded-xl text-xs font-semibold hover:bg-stone-50 min-h-[44px] flex items-center justify-center"
                >
                  Clear All
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-[#162238] transition-all min-h-[44px] flex items-center justify-center shadow-md active:scale-98"
              >
                Show Results ({totalResults})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
