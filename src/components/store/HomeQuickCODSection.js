'use client';

import React from 'react';
import QuickCODForm from '@/components/store/QuickCODForm';
import {
  Sparkles,
  Banknote,
  ShieldCheck,
  Truck,
  PhoneCall,
  Award,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Leaf,
  Clock,
  Star,
  Users,
} from 'lucide-react';

export default function HomeQuickCODSection() {
  return (
    <section
      id="quick-cod-section"
      className="relative w-full bg-gradient-to-b from-[#060E1A] via-[#0B172B] to-[#060E1A] text-white py-12 sm:py-16 md:py-20 border-y-2 border-[#D4AF37]/35 shadow-[0_25px_60px_rgba(5,12,24,0.4)] overflow-hidden"
    >
      {/* Dynamic Golden Ambient Aura Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] pointer-events-none -translate-y-1/2 blur-2xl" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none translate-y-1/3 blur-2xl" />

      {/* Top & Bottom Hairline Gold Accents */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-75" />
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

      {/* Centered Content Container - Spans Full Width Elegantly */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ================= LEFT COLUMN: AUTHORITY, TRUST & PROMISES (5 COLS) ================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* AYUSH Verified & Classical Seal Badge */}
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/60 text-[#F3E5AB] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#F3E5AB] shrink-0" />
              <span>AYUSH Certified Classical Ayurveda</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
                घर बैठे मंगवाएं 100% शुद्ध{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F7E7A9] to-[#C5A059]">
                  आयुर्वेदिक औषधियां
                </span>
              </h2>
              <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-xl">
                <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cash on Delivery (COD) उपलब्ध • ₹0 अग्रिम भुगतान</span>
              </div>
            </div>

            {/* Subtext description */}
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              कोई लंबी प्रक्रिया या ऑनलाइन पेमेंट का झंझट नहीं। सिर्फ <strong>नाम, मोबाइल नंबर और अपनी समस्या (बवासीर या माइग्रेन)</strong> चुनें — हमारे वरिष्ठ आयुर्वेदाचार्य (वैद्य जी) आपसे फोन पर संपर्क कर संपूर्ण मार्गदर्शन व उचित दवा <strong>कैश ऑन डिलीवरी</strong> द्वारा भेजेंगे!
            </p>

            {/* 4 Feature Grid Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-[#D4AF37]/25 backdrop-blur-xs hover:border-[#D4AF37]/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-serif">100% COD उपलब्ध</h4>
                  <p className="text-[11px] text-stone-300 leading-tight mt-0.5">
                    दवा हाथ में आने पर ही नकद भुगतान करें
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-[#D4AF37]/25 backdrop-blur-xs hover:border-[#D4AF37]/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-serif">निःशुल्क वैद्यकीय सलाह</h4>
                  <p className="text-[11px] text-stone-300 leading-tight mt-0.5">
                    वरिष्ठ वैद्य जी से सीधे फोन पर बात
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-[#D4AF37]/25 backdrop-blur-xs hover:border-[#D4AF37]/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-serif">4 से 5 दिन में डिलीवरी</h4>
                  <p className="text-[11px] text-stone-300 leading-tight mt-0.5">
                    पूरे भारत के 19,000+ पिन कोड पर
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-[#D4AF37]/25 backdrop-blur-xs hover:border-[#D4AF37]/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-serif">100% शुद्ध व प्राकृतिक</h4>
                  <p className="text-[11px] text-stone-300 leading-tight mt-0.5">
                    चरक संहिता अनुसार सिद्ध रस-औषधियां
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor Helpline Banner */}
            <div className="p-4 rounded-2xl bg-[#091529]/95 border border-[#D4AF37]/45 flex items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C5A059] text-[#0F1D36] flex items-center justify-center font-bold shadow-md shrink-0">
                  <PhoneCall className="w-5 h-5 text-[#0F1D36]" />
                </div>
                <div>
                  <span className="block text-[10px] text-[#C5A059] uppercase font-bold tracking-wider">
                    सीधे आयुर्वेदाचार्य से बात करें
                  </span>
                  <a
                    href="tel:+917309523829"
                    className="text-base sm:text-lg font-extrabold text-white hover:text-[#F3E5AB] tracking-wide transition-colors"
                  >
                    +91 73095 23829
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 rounded-full shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>निःशुल्क परामर्श चालू</span>
              </div>
            </div>

            {/* Proof Pill: 1,50,000+ Happy Families */}
            <div className="flex items-center gap-4 text-xs text-stone-300 pt-1">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-semibold">
                <strong>4.9/5</strong> • 1,50,000+ संतुष्ट भारतीय परिवार
              </span>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: ULTRA-CLEAN 3-FIELD HIGH CONVERTING FORM (7 COLS) ================= */}
          <div className="lg:col-span-7">
            <QuickCODForm source="homepage_section" />
          </div>

        </div>
      </div>
    </section>
  );
}
