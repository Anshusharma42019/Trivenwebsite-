import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-8 h-8 text-[#1B4332]" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              404 • Page Not Found
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Formulation Not Discovered
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            The page or classical remedy you are seeking may have been repositioned or retired from the active apothecary directory.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Home className="w-4 h-4 text-[#D4AF37]" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Products</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
