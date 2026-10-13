'use client';

import React from 'react';
import Link from 'next/link';

const HEALTH_CATEGORIES = [
  {
    name: 'Herbal Supplements',
    slug: 'herbal-supplements',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400',
    tag: 'Daily Vitality',
  },
  {
    name: 'Ayurvedic Oils',
    slug: 'ayurvedic-oils',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400',
    tag: 'Scalp & Joints',
  },
  {
    name: 'Digestive Wellness',
    slug: 'digestive-wellness',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400',
    tag: 'Agni & Gut Detox',
  },
  {
    name: 'Skin & Hair Care',
    slug: 'skin-and-hair',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=400',
    tag: 'Kashmiri Saffron',
  },
  {
    name: 'Immunity & Rasayana',
    slug: 'immunity-rasayana',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
    tag: 'Ojas & Stamina',
  },
  {
    name: 'Classical Formulations',
    slug: '',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400',
    tag: 'All 41 Samhitas',
  },
];

export default function AmazonCategoryPills() {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-6 sm:my-10">
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-lg sm:text-2xl">
              Shop by Ayurvedic Health Need
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Explore time-honored remedies customized to your wellness focus</p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline self-start sm:self-auto min-h-[32px] flex items-center"
          >
            View all categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 xxs:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {HEALTH_CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.slug ? `/products?category=${cat.slug}` : '/products'}
              className="flex flex-col items-center text-center group min-w-0"
            >
              <div className="w-20 h-20 xxs:w-24 xxs:h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-stone-200 group-hover:border-[#1B4332] group-hover:shadow-md transition-all p-1 bg-stone-50 mb-2">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-[#1B4332] transition-colors leading-tight line-clamp-2">
                {cat.name}
              </h3>
              <span className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                {cat.tag}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
