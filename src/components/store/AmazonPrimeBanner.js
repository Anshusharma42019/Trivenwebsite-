'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Truck, Check, Copy, Banknote } from 'lucide-react';

export default function AmazonPrimeBanner() {
  const [copied, setCopied] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    const fetchActiveCoupon = async () => {
      try {
        const res = await fetch('/api/coupons');
        const json = await res.json();
        if (res.ok && json.data && json.data.length > 0) {
          const active = json.data.find((c) => c.isActive !== false);
          if (active) setCouponCode(active.code);
        }
      } catch (e) {
        // Silently fallback if no network/coupons
      }
    };
    fetchActiveCoupon();
  }, []);

  const copyCode = () => {
    if (!couponCode) return;
    navigator.clipboard?.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-8 sm:my-12">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F1D36] via-[#162238] to-[#1B2A4A] text-white p-5 sm:p-8 lg:p-10 shadow-[0_12px_40px_rgba(15,29,54,0.18)] border border-[#D4AF37]/45">
        {/* Subtle decorative gold light sweep */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#F5EDE0] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#F3E5AB]" />
              <span className="text-[#F3E5AB]">TRIVEN VEDIC PRIME CLUB</span>
            </div>

            <h2 className="text-white font-serif text-xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight drop-shadow-sm">
              Enjoy Unlimited Free Express Delivery on All Orders
            </h2>

            <p className="text-[#F5EDE0] text-xs sm:text-base font-normal leading-relaxed">
              Plus receive 15% instant off on your first order, priority Vaidya consultations, and quarterly seasonal detox guides.
            </p>

            <div className="flex flex-col xs:flex-row flex-wrap gap-2.5 sm:gap-4 pt-1 sm:pt-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-medium bg-[#0B1527]/80 text-white px-3.5 py-1.5 rounded-lg border border-[#D4AF37]/35 shadow-xs">
                <Truck className="w-4 h-4 text-[#F3E5AB] shrink-0" />
                <span className="text-white font-semibold">Delivery in 4-5 Days (4 se 5 Din)</span>
              </div>
              <div className="flex items-center gap-2 font-medium bg-[#0B1527]/80 text-white px-3.5 py-1.5 rounded-lg border border-[#D4AF37]/35 shadow-xs">
                <Banknote className="w-4 h-4 text-[#F3E5AB] shrink-0" />
                <span className="text-white font-semibold">Cash on Delivery (COD) Available</span>
              </div>
              <div className="flex items-center gap-2 font-medium bg-[#0B1527]/80 text-white px-3.5 py-1.5 rounded-lg border border-[#D4AF37]/35 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#F3E5AB] shrink-0" />
                <span className="text-white font-semibold">100% Genuine Samhita Guarantee</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row lg:flex-col items-stretch xs:items-center lg:items-end gap-3.5 shrink-0 w-full lg:w-auto">
            {/* Coupon Code Pill */}
            {couponCode && (
              <div className="flex items-center justify-between sm:justify-start gap-3 bg-[#0B1527] border-2 border-[#D4AF37]/60 rounded-2xl p-2.5 px-4 shadow-md w-full xs:w-auto">
                <div className="text-left">
                  <span className="block text-[10px] text-[#EADFC9] uppercase font-bold tracking-wider">Special Coupon</span>
                  <span className="text-base font-extrabold text-[#F3E5AB] tracking-widest">{couponCode}</span>
                </div>
                <button
                  onClick={copyCode}
                  className="ml-2 bg-[#1B2A4A] hover:bg-[#253860] text-white p-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-[#D4AF37]/40 shadow-xs active:scale-95 cursor-pointer shrink-0"
                  aria-label="Copy Coupon"
                >
                  {copied ? <Check className="w-4 h-4 text-[#F3E5AB]" /> : <Copy className="w-4 h-4 text-stone-200" />}
                  <span className="text-white font-bold">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}

            <Link
              href="/products"
              className="w-full xs:w-auto bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] hover:brightness-110 text-[#0F1D36] font-extrabold px-6 sm:px-8 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-[0_6px_24px_rgba(212,175,55,0.4)] text-center min-h-[44px] flex items-center justify-center tracking-wide"
            >
              Shop With Vedic Prime
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
