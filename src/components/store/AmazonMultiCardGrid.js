'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, ShieldCheck, ArrowRight, Star } from 'lucide-react';

export default function AmazonMultiCardGrid() {
  // Lightning deal countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-20 md:-mt-28 lg:-mt-32 mb-8 sm:mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* CARD 1: 4-Quadrant Daily Essentials */}
        <div className="bg-white rounded-xl shadow-md border border-stone-200 p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-lg leading-tight mb-1">
              Revitalize Your Health
            </h2>
            <p className="text-xs text-stone-500 mb-4">Daily classical wellness essentials</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Link href="/products/organic-ashwagandha-ksm-66-churna" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400"
                    alt="Ashwagandha Churna"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">Ashwagandha</p>
                <span className="text-[11px] text-emerald-700 font-semibold">Stress & Energy</span>
              </Link>

              <Link href="/products/triphala-gut-detox-vati" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400"
                    alt="Triphala Gut Vati"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">Triphala Vati</p>
                <span className="text-[11px] text-emerald-700 font-semibold">Gut Detox</span>
              </Link>

              <Link href="/products/himalayan-shilajit-gold-resin" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400"
                    alt="Shilajit Gold Resin"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">Pure Shilajit</p>
                <span className="text-[11px] text-emerald-700 font-semibold">75% Fulvic Acid</span>
              </Link>

              <Link href="/products/brahmi-medhya-rasayana-churna" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400"
                    alt="Brahmi Churna"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">Brahmi Churna</p>
                <span className="text-[11px] text-emerald-700 font-semibold">Memory & Focus</span>
              </Link>
            </div>
          </div>

          <Link
            href="/products?category=herbal-supplements"
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline flex items-center gap-1 pt-2 border-t border-stone-100"
          >
            <span>See all classical supplements</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* CARD 2: 4-Quadrant Classical Tailas & Oils */}
        <div className="bg-white rounded-xl shadow-md border border-stone-200 p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-lg leading-tight mb-1">
              Classical Ayurvedic Oils
            </h2>
            <p className="text-xs text-stone-500 mb-4">72-Hour slow wood-fired infusions</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Link href="/products/classical-maha-bhringraj-taila" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400"
                    alt="Maha Bhringraj Taila"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">Maha Bhringraj</p>
                <span className="text-[11px] text-[#B8860B] font-semibold">Scalp & Growth</span>
              </Link>

              <Link href="/products/kumkumadi-miraculous-beauty-oil" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=400"
                    alt="Kumkumadi Saffron Oil"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">Kumkumadi Tailam</p>
                <span className="text-[11px] text-[#B8860B] font-semibold">Kashmiri Saffron</span>
              </Link>

              <Link href="/products?category=ayurvedic-oils" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&q=80&w=400"
                    alt="Joint Pain Oil"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">Mahanarayan Taila</p>
                <span className="text-[11px] text-[#B8860B] font-semibold">Joint & Muscle</span>
              </Link>

              <Link href="/products?category=ayurvedic-oils" className="group">
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=400"
                    alt="Nalpamaradi Skin Oil"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium text-stone-800 line-clamp-1 group-hover:text-[#1B4332]">Nalpamaradi Taila</p>
                <span className="text-[11px] text-[#B8860B] font-semibold">De-Tan & Radiance</span>
              </Link>
            </div>
          </div>

          <Link
            href="/products?category=ayurvedic-oils"
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline flex items-center gap-1 pt-2 border-t border-stone-100"
          >
            <span>Explore all herbal tailas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* CARD 3: Amazon-style Lightning Deal Feature */}
        <div className="bg-white rounded-xl shadow-md border border-stone-200 p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="bg-red-700 text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                Deal of the Day
              </span>
              <div className="flex items-center gap-1 text-xs text-red-700 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            <h2 className="font-serif font-bold text-stone-900 text-lg leading-tight mt-1 mb-2">
              Himalayan Shilajit Gold
            </h2>

            {/* Featured Image */}
            <Link href="/products/himalayan-shilajit-gold-resin" className="block group mb-3">
              <div className="relative aspect-4/3 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                <img
                  src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600"
                  alt="Himalayan Shilajit Gold Resin"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-2 left-2 bg-[#D4AF37] text-[#1B4332] text-xs font-bold px-2 py-0.5 rounded shadow-xs">
                  24% OFF
                </span>
              </div>
            </Link>

            {/* Pricing Details */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#1B4332]">₹1,449</span>
                <span className="text-xs text-stone-400 line-through">₹1,899</span>
                <span className="text-xs text-red-600 font-bold">Save ₹450</span>
              </div>
              <p className="text-xs text-stone-600 line-clamp-1">
                20g Pure Resin with Swarna Bhasma (Gold)
              </p>

              {/* Amazon-style Claim Progress Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                  <span>78% Claimed</span>
                  <span className="text-red-700 font-medium">Only 12 left</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                  <div className="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/products/himalayan-shilajit-gold-resin"
            className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline flex items-center gap-1 pt-2 border-t border-stone-100 mt-3"
          >
            <span>Claim this lightning deal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* CARD 4: Free Vaidya Consultation & Dosha Assessment */}
        <div className="bg-gradient-to-br from-emerald-900 to-[#1B4332] text-white rounded-xl shadow-md border border-emerald-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Free Ayurvedic Assessment</span>
            </div>

            <h2 className="font-serif font-bold text-white text-lg leading-tight mb-2">
              Know Your Prakriti (Dosha)
            </h2>
            <p className="text-xs text-emerald-100 leading-relaxed mb-4">
              Take a 2-minute diagnostic assessment formulated by Haridwar Vaidyas to discover whether you are Vata, Pitta, or Kapha.
            </p>

            <div className="bg-emerald-950/60 rounded-lg p-3 border border-emerald-700/60 space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-stone-200">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Personalized classical formulation map</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-200">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Diet & Dinacharya recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-200">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>1-on-1 Certified Vaidya chat support</span>
              </div>
            </div>

            <Link
              href="/products?category=immunity-rasayana"
              className="block w-full text-center bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-md"
            >
              Start Free 2-Min Dosha Quiz
            </Link>
          </div>

          <Link
            href="/products"
            className="text-xs font-semibold text-emerald-200 hover:text-white hover:underline flex items-center gap-1 pt-2 border-t border-emerald-800/80 mt-3"
          >
            <span>Consult senior Vaidya online</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
