'use client';

import React from 'react';
import { ShieldCheck, Truck, Award, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AmazonTrustStrip() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-6">
        <h3 className="font-serif font-bold text-center text-stone-900 text-lg mb-6">
          Why 1,50,000+ Indian Families Order Classical Ayurveda From Triven
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1B4332] border border-emerald-200 flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-6 h-6 text-[#1B4332]" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">AYUSH Certified Formulations</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">Strict compliance with Ayurvedic Pharmacopoeia of India</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1B4332] border border-emerald-200 flex items-center justify-center mb-2.5">
              <Award className="w-6 h-6 text-[#1B4332]" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">NABL Lab Tested Purity</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">Every batch tested for heavy metals, pesticides & microbes</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1B4332] border border-emerald-200 flex items-center justify-center mb-2.5">
              <Truck className="w-6 h-6 text-[#1B4332]" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">Fast Pan-India Express</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">Dispatched within 24 hours to 19,000+ pin codes</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1B4332] border border-emerald-200 flex items-center justify-center mb-2.5">
              <RefreshCw className="w-6 h-6 text-[#1B4332]" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">Cash on Delivery & Easy Returns</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">Pay safely at doorstep with zero advance obligation</p>
          </div>
        </div>
      </div>
    </section>
  );
}
