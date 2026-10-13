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
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Triven Prime</span>
        </h4>
        <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer hover:text-[#1B4332]">
          <input type="checkbox" defaultChecked className="rounded text-[#1B4332] focus:ring-0" />
          <span className="font-bold text-[#1B4332]">✓ Triven Prime</span>
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
      <div className="pb-4 border-b border-stone-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-serif font-bold text-sm text-stone-900">
            Category
          </h4>
          {currentCategory && (
            <Link
              href={buildUrl({ category: null })}
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#1B4332] font-bold hover:underline"
            >
              Clear
            </Link>
          )}
        </div>

        <div className="space-y-1 text-xs max-h-60 overflow-y-auto touch-scroll pr-1">
          <Link
            href={buildUrl({ category: null })}
            onClick={() => setIsOpen(false)}
            className={`block py-1.5 px-2 rounded-md ${
              !currentCategory
                ? 'font-bold text-[#1B4332] bg-emerald-50'
                : 'text-stone-700 hover:text-[#1B4332]'
            }`}
          >
            All Classical Formulations
          </Link>
          {categories.map((c) => (
            <Link
              key={c._id?.toString() || c.slug}
              href={buildUrl({ category: c.slug })}
              onClick={() => setIsOpen(false)}
              className={`block py-1.5 px-2 rounded-md ${
                currentCategory === c.slug
                  ? 'font-bold text-[#1B4332] bg-emerald-50'
                  : 'text-stone-700 hover:text-[#1B4332]'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Price Filter Presets */}
      <div className="pb-4 border-b border-stone-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-serif font-bold text-sm text-stone-900">
            Price
          </h4>
          {(minPrice || maxPrice) && (
            <Link
              href={buildUrl({ minPrice: null, maxPrice: null })}
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#1B4332] font-bold hover:underline"
            >
              Clear
            </Link>
          )}
        </div>
        <div className="space-y-1 text-xs text-stone-700">
          <Link
            href={buildUrl({ minPrice: null, maxPrice: '400' })}
            onClick={() => setIsOpen(false)}
            className={`block py-1.5 px-2 rounded-md ${
              maxPrice === '400' && !minPrice
                ? 'font-bold text-[#1B4332] bg-emerald-50'
                : 'hover:text-[#1B4332] hover:underline'
            }`}
          >
            Under ₹400
          </Link>
          <Link
            href={buildUrl({ minPrice: '400', maxPrice: '800' })}
            onClick={() => setIsOpen(false)}
            className={`block py-1.5 px-2 rounded-md ${
              minPrice === '400' && maxPrice === '800'
                ? 'font-bold text-[#1B4332] bg-emerald-50'
                : 'hover:text-[#1B4332] hover:underline'
            }`}
          >
            ₹400 - ₹800
          </Link>
          <Link
            href={buildUrl({ minPrice: '800', maxPrice: '1500' })}
            onClick={() => setIsOpen(false)}
            className={`block py-1.5 px-2 rounded-md ${
              minPrice === '800' && maxPrice === '1500'
                ? 'font-bold text-[#1B4332] bg-emerald-50'
                : 'hover:text-[#1B4332] hover:underline'
            }`}
          >
            ₹800 - ₹1,500
          </Link>
          <Link
            href={buildUrl({ minPrice: '1500', maxPrice: null })}
            onClick={() => setIsOpen(false)}
            className={`block py-1.5 px-2 rounded-md ${
              minPrice === '1500' && !maxPrice
                ? 'font-bold text-[#1B4332] bg-emerald-50'
                : 'hover:text-[#1B4332] hover:underline'
            }`}
          >
            Over ₹1,500
          </Link>
        </div>
      </div>

      {/* Brands & Vaidyashalas */}
      <div className="pb-4 border-b border-stone-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-serif font-bold text-sm text-stone-900">
            Brands & Vaidyashalas
          </h4>
          {currentBrand && (
            <Link
              href={buildUrl({ brand: null })}
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#1B4332] font-bold hover:underline"
            >
              Clear
            </Link>
          )}
        </div>
        <div className="space-y-1.5 text-xs text-stone-700 max-h-52 overflow-y-auto touch-scroll pr-1">
          {brands.map((b) => {
            const isSelected = currentBrand === b.slug;
            return (
              <Link
                key={b._id?.toString() || b.slug}
                href={buildUrl({ brand: isSelected ? null : b.slug })}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 py-1 px-1 rounded hover:text-[#1B4332] ${
                  isSelected ? 'font-bold text-[#1B4332] bg-emerald-50/70' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="rounded text-[#1B4332] focus:ring-0"
                />
                <span>{b.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dosage Forms */}
      <div className="pb-4 border-b border-stone-100">
        <h4 className="font-serif font-bold text-sm text-stone-900 mb-2">
          Dosage Form
        </h4>
        <div className="space-y-1 text-xs text-stone-700">
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#1B4332] py-0.5">
            <input type="checkbox" defaultChecked className="rounded text-[#1B4332]" />
            <span>Churna (Powder)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#1B4332] py-0.5">
            <input type="checkbox" defaultChecked className="rounded text-[#1B4332]" />
            <span>Taila (Oil Infusion)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#1B4332] py-0.5">
            <input type="checkbox" defaultChecked className="rounded text-[#1B4332]" />
            <span>Vati / Gutika (Tablets)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#1B4332] py-0.5">
            <input type="checkbox" defaultChecked className="rounded text-[#1B4332]" />
            <span>Avaleha (Paste / Resin)</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile / Tablet Filter Trigger Button Bar (<lg) */}
      <div className="lg:hidden flex items-center justify-between gap-2 bg-white rounded-xl border border-stone-200 p-2.5 mb-4 shadow-2xs">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-semibold py-2.5 px-3 rounded-lg min-h-[44px] transition-colors"
          aria-label="Open Filters"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#1B4332]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#1B4332] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <Link
            href="/products"
            className="text-xs font-medium text-stone-500 hover:text-red-700 px-3 py-2.5 min-h-[44px] flex items-center"
          >
            Clear All
          </Link>
        )}
      </div>

      {/* Desktop Persistent Left Sidebar (lg:block) */}
      <aside className="hidden lg:block lg:col-span-1 space-y-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
            <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#1B4332]" />
              <span>Filters</span>
            </h3>
            {activeFilterCount > 0 && (
              <Link
                href="/products"
                className="text-xs text-[#1B4332] font-semibold hover:underline"
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
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#1B4332]" />
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
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
            <div className="p-4 border-t border-stone-200 bg-white flex items-center gap-3">
              {activeFilterCount > 0 ? (
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center py-2.5 px-3 border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-50 min-h-[44px] flex items-center justify-center"
                >
                  Clear All
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-[#1B4332] text-white py-2.5 px-4 rounded-lg text-xs font-bold hover:bg-[#2D6A4F] transition-colors min-h-[44px] flex items-center justify-center shadow-xs"
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
