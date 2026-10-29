'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-[#2C2523] px-4 py-16 selection:bg-[#C5A059]/20 selection:text-[#0F1D36]">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#EBE6DD] shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center mx-auto shadow-md">
          <Compass className="w-8 h-8 text-[#D4AF37]" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
            404 • Page Not Found
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14171F]">
            Formulation Not Discovered
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-[#6E6761] leading-relaxed">
          The page or classical remedy you are seeking may have been repositioned or retired from the active apothecary directory.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] border border-[#D4AF37]/40 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Home className="w-4 h-4 text-[#D4AF37]" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#14171F] border border-stone-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
