'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RefreshCw, Award, ChevronUp, Globe } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0F1D36] text-stone-300 mt-16 border-t border-[#D4AF37]/25 pb-24 md:pb-8">
      {/* Amazon-style 'Back to Top' Bar */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#080F1D] hover:bg-[#142038] text-[#D4AF37] text-xs font-semibold py-3.5 transition-colors flex items-center justify-center gap-1 border-b border-[#D4AF37]/20"
      >
        <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
        <span>Back to top</span>
      </button>

      {/* Main Multi-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-8 pb-12 border-b border-stone-800 text-xs text-center sm:text-left">
          
          {/* Column 1: Get to Know Us */}
          <div className="space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="font-serif font-bold text-white text-sm tracking-wide">
              Get to Know Us
            </h4>
            <ul className="space-y-2 text-stone-400 w-full">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  About Triven Ayurveda
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Classical Samhitas Tradition
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  NABL Lab Testing & AYUSH
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Himalayan Botanical Farms
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Press Releases & Science
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Connect with Us */}
          <div className="space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="font-serif font-bold text-white text-sm tracking-wide">
              Connect with Us
            </h4>
            <ul className="space-y-2 text-stone-400 w-full">
              <li>
                <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp Vaidya Helpline
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Instagram (@trivenayurveda)
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Vedic Living YouTube Channel
                </a>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Ayurvedic Wellness Clinics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Partner with Us */}
          <div className="space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="font-serif font-bold text-white text-sm tracking-wide">
              Partner with Us
            </h4>
            <ul className="space-y-2 text-stone-400 w-full">
              <li>
                <Link href="/admin/bootstrap" className="hover:text-white transition-colors">
                  Ayurvedic Doctor / Vaidya Network
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Practitioner Wholesale Portal
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Become an Affiliate
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Supply Wild Himalayan Herbs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Let Us Help You */}
          <div className="space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="font-serif font-bold text-white text-sm tracking-wide">
              Let Us Help You
            </h4>
            <ul className="space-y-2 text-stone-400 w-full">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Your Account
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Your Orders & Tracking
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Shipping Rates & Vedic Prime
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Returns & Replacements Policy
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Help Center & Customer Care
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Brand & Language Middle Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-800 text-center sm:text-left">
          <Link href="/" className="flex items-center justify-center sm:justify-start gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0F1D36] flex items-center justify-center font-serif text-lg font-bold shadow-sm">
              ॐ
            </div>
            <span className="font-serif text-lg font-bold text-white tracking-wide">
              TRIVEN AYURVEDA
            </span>
          </Link>

          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-3 text-xs">
            <span className="py-1 px-3 border border-stone-800 rounded text-stone-300 inline-flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>English - EN</span>
            </span>
            <span className="py-1 px-3 border border-stone-800 rounded text-stone-300">
              ₹ INR - Indian Rupee
            </span>
            <span className="py-1 px-3 border border-stone-800 rounded text-stone-300">
              India
            </span>
          </div>
        </div>

        {/* Bottom Legal & AYUSH Disclaimer (Mandatory Regulatory Transparency) */}
        <div className="pt-6 text-[11px] text-stone-500 space-y-3 text-center sm:text-left">
          <p className="leading-relaxed text-center sm:text-left">
            <strong>Statutory Medical Notice:</strong> Formulations sold on Triven Ayurveda are manufactured in AYUSH-licensed GMP certified facilities in accordance with classical Ayurvedic Samhitas (Charaka Samhita, Sushruta Samhita, and Ayurvedic Pharmacopoeia of India). Information provided is for educational purposes and not intended as a substitute for professional clinical advice.
          </p>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 pt-2 text-stone-400 text-center sm:text-left">
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
              <Link href="/products" className="hover:underline">Conditions of Use & Sale</Link>
              <Link href="/products" className="hover:underline">Privacy Notice</Link>
              <Link href="/products" className="hover:underline">AYUSH Certification Disclosures</Link>
            </div>
            <p className="text-center sm:text-right">© 2026 Triven Ayurveda Labs Pvt Ltd. All rights reserved. Sourced & Handcrafted with Classical Botanical Purity.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
