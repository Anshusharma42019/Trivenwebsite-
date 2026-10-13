'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: 'The Great Vedic Health Festival',
    tagline: 'Up to 35% Off on Pure Classical Samhita Formulations',
    description: 'Authentic remedies prepared strictly by Charaka & Sushruta guidelines with lab-tested Himalayan herbs.',
    badge: 'AYUSH Certified Standards',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1600',
    linkUrl: '/products',
    ctaText: 'Shop Festival Deals',
    accentColor: '#D4AF37',
  },
  {
    id: 2,
    title: '72-Hour Wood-Fired Classical Tailas',
    tagline: 'Slow Kshirapaka Herbal Infusions for Hair & Joints',
    description: 'Cold-pressed sesame base cooked with 21 medicinal botanicals over 3 sun cycles for deep cellular absorption.',
    badge: 'Handcrafted in Uttarakhand',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-54a7c866b8fb?auto=format&fit=crop&q=80&w=1600',
    linkUrl: '/products?category=ayurvedic-oils',
    ctaText: 'Explore Pure Oils',
    accentColor: '#52B788',
  },
  {
    id: 3,
    title: 'Himalayan Shilajit Gold & Ashwagandha',
    tagline: 'Supreme Rejuvenation • 100% Tested Lab Purity',
    description: 'Wild-harvested at 18,000+ ft. Rich in >75% Fulvic Acid, Swarna Bhasma, and full-spectrum Withanolides.',
    badge: 'Heavy Metal Lab Certified',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=1600',
    linkUrl: '/products?category=herbal-supplements',
    ctaText: 'Shop Vitality Rasayanas',
    accentColor: '#D4AF37',
  },
];

export default function AmazonHeroCarousel() {
  const [slides, setSlides] = useState(SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch dynamic banners from database
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await fetch('/api/banners');
        const json = await res.json();
        if (res.ok && json.data && json.data.length > 0) {
          const dynamicSlides = json.data.map((b) => ({
            id: b._id,
            title: b.title,
            tagline: b.subtitle || 'Classical Vedic Samhita Formulation',
            description: b.subtitle || 'Handcrafted in Uttarakhand according to Charaka Samhita.',
            badge: b.badge || 'AYUSH Certified Standards',
            imageUrl: b.imageUrl,
            linkUrl: b.linkUrl || '/products',
            ctaText: b.ctaText || 'Explore Remedy',
            accentColor: '#D4AF37',
          }));
          setSlides(dynamicSlides);
        }
      } catch (e) {
        // Fall back to default slides
      }
    };
    loadBanners();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full bg-[#1B4332] text-white overflow-hidden select-none">
      {/* Slider Container */}
      <div className="relative h-[360px] sm:h-[440px] md:h-[500px] lg:h-[540px] w-full">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 block' : 'opacity-0 z-0 hidden pointer-events-none'
              }`}
            >
              {/* Background Image with dark overlay */}
              <div className="absolute inset-0">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B4332]/95 via-[#1B4332]/85 to-transparent sm:w-3/4 md:w-2/3" />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Slide Content */}
              <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-xl space-y-2.5 sm:space-y-4 pb-14 sm:pb-24">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-950/70 border border-emerald-600/50 text-[#D4AF37] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide backdrop-blur-xs">
                    <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span>{slide.badge}</span>
                  </div>

                  {/* Main Title */}
                  <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
                    {slide.title}
                  </h1>

                  {/* Tagline */}
                  <p className="text-amber-200 font-medium text-xs sm:text-base md:text-lg">
                    {slide.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-stone-200 text-xs sm:text-sm leading-relaxed max-w-lg hidden sm:block">
                    {slide.description}
                  </p>

                  {/* CTA Buttons */}
                  <div className="pt-1 sm:pt-2 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                    <Link
                      href={slide.linkUrl}
                      className="bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-1.5 sm:gap-2 min-h-[40px] sm:min-h-[44px]"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </Link>
                    <Link
                      href="/products"
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-xs px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[40px] sm:min-h-[44px] flex items-center justify-center"
                    >
                      All Formulations
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Amazon Style) */}
      <button
        onClick={prevSlide}
        className="absolute left-1 sm:left-4 top-1/3 -translate-y-1/2 z-20 w-8 sm:w-11 h-11 sm:h-14 bg-black/30 hover:bg-black/60 text-white rounded flex items-center justify-center backdrop-blur-xs transition-colors border border-white/20 focus:outline-none"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 sm:w-7 h-5 sm:h-7" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-1 sm:right-4 top-1/3 -translate-y-1/2 z-20 w-8 sm:w-11 h-11 sm:h-14 bg-black/30 hover:bg-black/60 text-white rounded flex items-center justify-center backdrop-blur-xs transition-colors border border-white/20 focus:outline-none"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 sm:w-7 h-5 sm:h-7" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-20 sm:bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 sm:h-2 rounded-full transition-all ${
              i === currentSlide ? 'w-6 sm:w-8 bg-[#D4AF37]' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* The Crucial Amazon-style Gradient Bleed into Overlapping Cards */}
      <div className="absolute bottom-0 inset-x-0 h-32 sm:h-40 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/85 to-transparent pointer-events-none z-10" />
    </div>
  );
}
