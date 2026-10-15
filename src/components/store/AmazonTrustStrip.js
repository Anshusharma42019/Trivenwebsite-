'use client';

import React from 'react';
import { ShieldCheck, Truck, Award, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AmazonTrustStrip() {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-8 sm:my-12">
      <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(15,29,54,0.05)] border border-[#C5A059]/25 p-5 sm:p-10 relative overflow-hidden">
        {/* Subtle decorative gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-80" />

        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#C5A059] block mb-1">
            ✦ Royal Heritage & Standards ✦
          </span>
          <h3 className="font-serif font-bold text-stone-900 text-base sm:text-2xl">
            Why 1,50,000+ Indian Families Trust Triven Ayurveda
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
          <div className="flex flex-col items-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0F1D36] to-[#1B2A4A] text-[#C5A059] border border-[#C5A059]/40 shadow-sm flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-108 group-hover:border-[#C5A059] transition-all duration-300">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A059]" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">AYUSH Certified Formulations</h4>
            <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 sm:mt-1 leading-relaxed">Strict compliance with Ayurvedic Pharmacopoeia of India</p>
          </div>

          <div className="flex flex-col items-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0F1D36] to-[#1B2A4A] text-[#C5A059] border border-[#C5A059]/40 shadow-sm flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-108 group-hover:border-[#C5A059] transition-all duration-300">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A059]" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">NABL Lab Tested Purity</h4>
            <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 sm:mt-1 leading-relaxed">Every batch tested for heavy metals, pesticides & microbes</p>
          </div>

          <div className="flex flex-col items-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0F1D36] to-[#1B2A4A] text-[#C5A059] border border-[#C5A059]/40 shadow-sm flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-108 group-hover:border-[#C5A059] transition-all duration-300">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A059]" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">Pan-India Express Dispatch</h4>
            <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 sm:mt-1 leading-relaxed">Dispatched in 24 hours to 19,000+ PIN codes with live tracking</p>
          </div>

          <div className="flex flex-col items-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0F1D36] to-[#1B2A4A] text-[#C5A059] border border-[#C5A059]/40 shadow-sm flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-108 group-hover:border-[#C5A059] transition-all duration-300">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A059]" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">Cash on Delivery & Guarantee</h4>
            <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 sm:mt-1 leading-relaxed">Pay safely at doorstep with zero advance obligation</p>
          </div>
        </div>
      </div>
    </section>
  );
}
