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
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-8 sm:my-12">
      <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(15,29,54,0.05)] border border-[#C5A059]/25 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#C5A059] block mb-0.5">
              ✦ Classical Categories ✦
            </span>
            <h2 className="font-serif font-bold text-stone-900 text-lg sm:text-2xl">
              Shop by Ayurvedic Health Need
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Explore time-honored remedies customized to your wellness focus
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#8C5E3C] hover:text-[#0F1D36] hover:underline self-start sm:self-auto min-h-[32px] flex items-center gap-1"
          >
            <span>View all categories</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-5">
          {categories.map((cat, idx) => {
            const IconComponent = CATEGORY_ICONS[idx % CATEGORY_ICONS.length];
            const hasUploadedImage = Boolean(cat.image && cat.image.trim() !== '');

            return (
              <Link
                key={cat._id || idx}
                href={cat.slug ? `/products?category=${cat.slug}` : '/products'}
                className="flex flex-col items-center text-center group min-w-0"
              >
                <div className="w-18 h-18 xxs:w-20 xxs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-stone-200/90 group-hover:border-[#C5A059] group-hover:shadow-[0_8px_25px_rgba(212,175,55,0.25)] transition-all duration-300 p-1 bg-[#FAF8F5] mb-2 flex items-center justify-center">
                  {hasUploadedImage ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-108 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-amber-500/10 flex flex-col items-center justify-center text-[#8C5E3C] group-hover:bg-[#0F1D36] group-hover:text-[#C5A059] transition-all duration-300 p-2">
                      <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
                    </div>
                  )}
                </div>
                <h3 className="text-[11px] sm:text-xs md:text-sm font-serif font-bold text-stone-900 group-hover:text-[#8C5E3C] transition-colors leading-tight line-clamp-2">
                  {cat.name}
                </h3>
                {cat.description && (
                  <span className="text-[9.5px] sm:text-[11px] text-stone-500 mt-0.5 line-clamp-1 hidden xs:block">
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
