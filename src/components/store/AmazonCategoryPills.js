'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, HeartPulse, Droplets, Shield, Flame, Activity } from 'lucide-react';

const CATEGORY_ICONS = [Sparkles, HeartPulse, Droplets, Shield, Flame, Activity];

export default function AmazonCategoryPills({ categories: initialCategories = null }) {
  const [categories, setCategories] = useState(initialCategories || []);
  const [loading, setLoading] = useState(!initialCategories);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
      setLoading(false);
      return;
    }

    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (res.ok && json.data) {
          setCategories(json.data.filter((c) => c.isActive !== false));
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [initialCategories]);

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-6 sm:my-10">
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-lg sm:text-2xl">
              Shop by Ayurvedic Health Need
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Explore time-honored remedies customized to your wellness focus
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline self-start sm:self-auto min-h-[32px] flex items-center"
          >
            View all categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 xxs:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat, idx) => {
            const IconComponent = CATEGORY_ICONS[idx % CATEGORY_ICONS.length];
            const hasUploadedImage = Boolean(cat.image && cat.image.trim() !== '');

            return (
              <Link
                key={cat._id || idx}
                href={cat.slug ? `/products?category=${cat.slug}` : '/products'}
                className="flex flex-col items-center text-center group min-w-0"
              >
                <div className="w-20 h-20 xxs:w-24 xxs:h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-stone-200 group-hover:border-[#1B4332] group-hover:shadow-md transition-all p-1 bg-stone-50 mb-2 flex items-center justify-center">
                  {hasUploadedImage ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-emerald-950/5 flex flex-col items-center justify-center text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-[#D4AF37] transition-colors p-2">
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
                    </div>
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-[#1B4332] transition-colors leading-tight line-clamp-2">
                  {cat.name}
                </h3>
                {cat.description && (
                  <span className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                    {cat.description}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
