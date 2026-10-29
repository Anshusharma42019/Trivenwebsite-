'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Banknote, X } from 'lucide-react';
import QuickCODForm from '@/components/store/QuickCODForm';

export default function FloatingQuickOrderButton() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Guarantee matching SSR & initial hydration output
  if (!mounted) {
    return null;
  }

  // Hide on checkout, admin, and order-now pages
  if (
    !pathname ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/order-now')
  ) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <aside 
        aria-label="Quick COD Order"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 bg-gradient-to-r from-[#0F1D36] via-[#162238] to-[#0F1D36] text-[#D4AF37] border-2 border-[#D4AF37] hover:border-[#F3E5AB] px-3.5 sm:px-4 py-2.5 rounded-full shadow-[0_6px_25px_rgba(15,29,54,0.35)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Order with Cash on Delivery"
        >
          {/* Pulsing indicator dot */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>

          <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex flex-col text-left leading-tight">
            <span className="text-[11px] sm:text-xs font-black tracking-wide text-white group-hover:text-[#F3E5AB]">
              COD आर्डर / परामर्श
            </span>
            <span className="text-[9px] text-[#D4AF37] font-semibold hidden xs:block">
              नाम, नंबर व बीमारी भरें
            </span>
          </span>
        </button>
      </aside>

      {/* Responsive Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <QuickCODForm
              source="floating_action_modal"
              compact={true}
              onSuccess={() => {}}
            />
          </div>
        </div>
      )}
    </>
  );
}

