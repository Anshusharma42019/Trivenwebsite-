'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Truck, Check, Copy } from 'lucide-react';

export default function AmazonPrimeBanner() {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText('VEDIC15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1B4332] via-[#245842] to-[#12281E] text-white p-6 sm:p-8 shadow-lg border border-emerald-700/50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TRIVEN VEDIC PRIME CLUB</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              Enjoy Unlimited Free Express Delivery on All Orders
            </h2>

            <p className="text-stone-200 text-xs sm:text-sm font-light leading-relaxed">
              Plus receive 15% instant off on your first order, priority Vaidya consultations, and quarterly seasonal detox guides.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs text-stone-300">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>Pan-India 1-2 Day Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Zero Minimum Order for Prime</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
            {/* Coupon Code Pill */}
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-600/60 rounded-xl p-2 px-3">
              <div className="text-left">
                <span className="block text-[10px] text-stone-400 uppercase font-semibold">Special Coupon</span>
                <span className="text-sm font-bold text-[#D4AF37] tracking-wider">VEDIC15</span>
              </div>
              <button
                onClick={copyCode}
                className="ml-2 bg-emerald-800 hover:bg-emerald-700 text-white p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                aria-label="Copy Coupon"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <Link
              href="/products"
              className="bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg text-center"
            >
              Shop With Vedic Prime
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
