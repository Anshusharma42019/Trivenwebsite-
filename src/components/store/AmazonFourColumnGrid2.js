'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export default function AmazonFourColumnGrid2() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* BOX 1: Hair & Scalp Wellness */}
        <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight mb-1">
              Hair Growth & Scalp
            </h3>
            <p className="text-xs text-stone-500 mb-3">Root nourishing classical infusions</p>

            <Link href="/products/classical-maha-bhringraj-taila" className="block group mb-3">
              <div className="aspect-4/3 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-2">
                <img
                  src="https://images.unsplash.com/photo-1608248597359-54a7c866b8fb?auto=format&fit=crop&q=80&w=600"
                  alt="Maha Bhringraj Taila"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-xs font-semibold text-stone-900 group-hover:text-[#1B4332]">
                Classical Maha Bhringraj Taila (200ml)
              </p>
              <div className="flex items-center gap-1.5 text-xs mt-0.5">
                <span className="font-bold text-[#1B4332]">₹699</span>
                <span className="text-stone-400 line-through">₹899</span>
                <span className="text-red-700 font-bold text-[11px]">22% off</span>
              </div>
            </Link>
          </div>

          <Link
            href="/products?category=ayurvedic-oils"
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline flex items-center gap-1 pt-2 border-t border-stone-100"
          >
            <span>Explore hair care remedies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* BOX 2: 4-Grid Digestive Remedies */}
        <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight mb-1">
              Deep Gut & Agni Care
            </h3>
            <p className="text-xs text-stone-500 mb-3">Charaka Samhita bowel balance</p>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <Link href="/products/triphala-gut-detox-vati" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1">
                  <img
                    src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=300"
                    alt="Triphala Vati"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="block text-[11px] font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">
                  Triphala Vati
                </span>
                <span className="text-[10px] text-stone-500">From ₹349</span>
              </Link>

              <Link href="/products?category=digestive-wellness" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1">
                  <img
                    src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=300"
                    alt="Avipattikar Churna"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="block text-[11px] font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">
                  Avipattikar
                </span>
                <span className="text-[10px] text-stone-500">From ₹299</span>
              </Link>

              <Link href="/products?category=digestive-wellness" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1">
                  <img
                    src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=300"
                    alt="Hingwashtak"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="block text-[11px] font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">
                  Hingwashtak
                </span>
                <span className="text-[10px] text-stone-500">From ₹240</span>
              </Link>

              <Link href="/products?category=digestive-wellness" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1">
                  <img
                    src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=300"
                    alt="Haritaki Cleanse"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="block text-[11px] font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">
                  Haritaki Pure
                </span>
                <span className="text-[10px] text-stone-500">From ₹220</span>
              </Link>
            </div>
          </div>

          <Link
            href="/products?category=digestive-wellness"
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline flex items-center gap-1 pt-2 border-t border-stone-100"
          >
            <span>See all digestive formulas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* BOX 3: Saffron & Beauty Elixirs */}
        <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight mb-1">
              Kashmiri Saffron Glow
            </h3>
            <p className="text-xs text-stone-500 mb-3">100% Pure Kumkumadi night elixir</p>

            <Link href="/products/kumkumadi-miraculous-beauty-oil" className="block group mb-3">
              <div className="aspect-4/3 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-2">
                <img
                  src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600"
                  alt="Kumkumadi Beauty Oil"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-xs font-semibold text-stone-900 group-hover:text-[#1B4332]">
                Kumkumadi Miraculous Beauty Oil (30ml)
              </p>
              <div className="flex items-center gap-1.5 text-xs mt-0.5">
                <span className="font-bold text-[#1B4332]">₹1,199</span>
                <span className="text-stone-400 line-through">₹1,499</span>
                <span className="text-red-700 font-bold text-[11px]">20% off</span>
              </div>
            </Link>
          </div>

          <Link
            href="/products?category=skin-and-hair"
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline flex items-center gap-1 pt-2 border-t border-stone-100"
          >
            <span>Shop facial oils & serums</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* BOX 4: Stress, Sleep & Vitality */}
        <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight mb-1">
              Stress, Sleep & Ojas
            </h3>
            <p className="text-xs text-stone-500 mb-3">Calm cortisol and sleep deeply</p>

            <Link href="/products/organic-ashwagandha-ksm-66-churna" className="block group mb-3">
              <div className="aspect-4/3 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-2">
                <img
                  src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600"
                  alt="Organic Ashwagandha Churna"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-xs font-semibold text-stone-900 group-hover:text-[#1B4332]">
                Organic Ashwagandha KSM-66 (150g)
              </p>
              <div className="flex items-center gap-1.5 text-xs mt-0.5">
                <span className="font-bold text-[#1B4332]">₹499</span>
                <span className="text-stone-400 line-through">₹649</span>
                <span className="text-red-700 font-bold text-[11px]">23% off</span>
              </div>
            </Link>
          </div>

          <Link
            href="/products?category=herbal-supplements"
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline flex items-center gap-1 pt-2 border-t border-stone-100"
          >
            <span>See vitality rasayanas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
