'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import ProductImage from './ProductImage';

export default function AmazonMultiCardGrid({ products = [] }) {
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

  const card1Products = products.slice(0, 4);
  const card2Products = products.length > 4 ? products.slice(4, 8) : (products.length > 0 ? products.slice(0, 4) : []);
  const dealProduct = products[0] || null;

  return (
    <div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-2 sm:-mt-20 md:-mt-28 lg:-mt-32 mb-6 sm:mb-12">
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 overflow-x-auto sm:overflow-visible touch-scroll snap-x snap-mandatory pb-3 sm:pb-0 scrollbar-none">
        
        {/* CARD 1: 4-Quadrant Daily Essentials */}
        <div className="w-[86vw] max-w-[340px] sm:w-auto shrink-0 snap-center bg-white rounded-2xl shadow-sm border border-stone-200/90 p-3.5 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-base sm:text-lg leading-tight mb-1">
              Revitalize Your Health
            </h2>
            <p className="text-xs text-stone-500 mb-3 sm:mb-4">Daily classical wellness essentials</p>

            {card1Products.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                {card1Products.map((p) => (
                  <Link key={p._id} href={`/products/${p.slug}`} className="group">
                    <div className="aspect-square bg-stone-50 rounded-lg overflow-hidden border border-stone-200 mb-1.5">
                      <ProductImage
                        src={p.images && p.images[0] ? p.images[0] : null}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-[11px] sm:text-xs font-medium text-stone-800 line-clamp-2 leading-tight group-hover:text-[#8C5E3C] h-7 sm:h-8 mb-0.5">
                      {p.name}
                    </p>
                    <span className="text-[11px] text-stone-900 font-bold block">
                      ₹{p.sellingPrice}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-lg mb-4">
                Products will appear once added by admin
              </div>
            )}
          </div>

          <Link
            href="/products"
            className="text-xs font-semibold text-stone-900 hover:text-[#8C5E3C] hover:underline flex items-center gap-1 pt-2.5 border-t border-stone-100"
          >
            <span>See all classical remedies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* CARD 2: 4-Quadrant Classical Formulations */}
        <div className="w-[86vw] max-w-[340px] sm:w-auto shrink-0 snap-center bg-white rounded-2xl shadow-sm border border-stone-200/90 p-3.5 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-base sm:text-lg leading-tight mb-1">
              Classical Samhita Remedies
            </h2>
            <p className="text-xs text-stone-500 mb-3 sm:mb-4">Time-honored Vedic preparations</p>

            {card2Products.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                {card2Products.map((p) => (
                  <Link key={`card2-${p._id}`} href={`/products/${p.slug}`} className="group">
                    <div className="aspect-square bg-stone-50 rounded-lg overflow-hidden border border-stone-200 mb-1.5">
                      <ProductImage
                        src={p.images && p.images[0] ? p.images[0] : null}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-[11px] sm:text-xs font-medium text-stone-800 line-clamp-2 leading-tight group-hover:text-[#8C5E3C] h-7 sm:h-8 mb-0.5">
                      {p.name}
                    </p>
                    <span className="text-[11px] text-stone-900 font-bold block">
                      ₹{p.sellingPrice}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-lg mb-4">
                More formulations will appear once added by admin
              </div>
            )}
          </div>

          <Link
            href="/products"
            className="text-xs font-semibold text-stone-900 hover:text-[#8C5E3C] hover:underline flex items-center gap-1 pt-2.5 border-t border-stone-100"
          >
            <span>Explore all formulations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* CARD 3: Lightning Deal Feature (Using real deal product) */}
        <div className="w-[86vw] max-w-[340px] sm:w-auto shrink-0 snap-center bg-white rounded-2xl shadow-sm border border-stone-200/90 p-3.5 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
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

            {dealProduct ? (
              <>
                <h2 className="font-serif font-bold text-stone-900 text-lg leading-tight mt-1 mb-2 line-clamp-1">
                  {dealProduct.name}
                </h2>

                <Link href={`/products/${dealProduct.slug}`} className="block group mb-3">
                  <div className="relative aspect-4/3 bg-stone-50 rounded-lg overflow-hidden border border-stone-200">
                    <ProductImage
                      src={dealProduct.images && dealProduct.images[0] ? dealProduct.images[0] : null}
                      alt={dealProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {dealProduct.mrp > dealProduct.sellingPrice && (
                      <span className="absolute top-2 left-2 bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                        {Math.round(((dealProduct.mrp - dealProduct.sellingPrice) / dealProduct.mrp) * 100)}% OFF
                      </span>
                    )}
                  </div>
                </Link>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-stone-900">₹{dealProduct.sellingPrice}</span>
                    {dealProduct.mrp > dealProduct.sellingPrice && (
                      <span className="text-xs text-stone-400 line-through">₹{dealProduct.mrp}</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-1">
                    {dealProduct.dosageForm || 'Classical Formulations'}
                  </p>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-lg my-4">
                Deals will update with newly uploaded medicines
              </div>
            )}
          </div>

          <Link
            href={dealProduct ? `/products/${dealProduct.slug}` : '/products'}
            className="text-xs font-semibold text-stone-900 hover:text-[#8C5E3C] hover:underline flex items-center gap-1 pt-2 border-t border-stone-100 mt-3"
          >
            <span>Claim this lightning deal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* CARD 4: Free Vaidya Consultation & Dosha Assessment */}
        <div className="w-[86vw] max-w-[340px] sm:w-auto shrink-0 snap-center bg-gradient-to-br from-[#0F1D36] via-[#142038] to-[#1B2A4A] text-white rounded-2xl shadow-[0_10px_35px_rgba(15,29,54,0.18)] border border-[#D4AF37]/45 p-4 sm:p-6 flex flex-col justify-between hover:shadow-[0_15px_45px_rgba(15,29,54,0.25)] transition-all duration-300">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Ayurvedic Assessment</span>
            </div>

            <h2 className="font-serif font-bold text-white text-xl leading-tight mb-2">
              Know Your Prakriti (Dosha)
            </h2>
            <p className="text-[#EADFC9] text-xs leading-relaxed mb-4 font-light">
              Take a 2-minute diagnostic assessment formulated by senior Ayurvedic Vaidyas to discover whether you are Vata, Pitta, or Kapha.
            </p>

            <div className="bg-[#0B1527]/90 rounded-xl p-3.5 border border-[#D4AF37]/25 space-y-2.5 mb-4">
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
              href="/products"
              className="block w-full text-center bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] hover:brightness-105 text-[#0F1D36] font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-[0_4px_18px_rgba(212,175,55,0.3)]"
            >
              Explore Certified Formulations
            </Link>
          </div>

          <Link
            href="/products"
            className="text-xs font-semibold text-[#D4AF37] hover:text-white hover:underline flex items-center gap-1 pt-3 border-t border-[#D4AF37]/25 mt-3"
          >
            <span>Consult senior Vaidya online</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
          </Link>
        </div>

      </div>
    </div>
  );
}
