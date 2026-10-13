'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

export default function AmazonHeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Fetch only admin-uploaded dynamic banners from database
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await fetch('/api/banners');
        const json = await res.json();
        if (res.ok && json.data && json.data.length > 0) {
          // Filter banners that have a valid admin-uploaded image
          const validBanners = json.data
            .filter((b) => b.isActive !== false && b.imageUrl && b.imageUrl.trim() !== '')
            .map((b) => ({
              id: b._id,
              title: b.title,
              tagline: b.subtitle || 'Classical Vedic Samhita Formulation',
              description: b.subtitle || 'Handcrafted in Uttarakhand according to Charaka Samhita.',
              badge: b.badge || 'AYUSH Certified Standards',
              imageUrl: b.imageUrl,
              linkUrl: b.linkUrl || '/products',
              ctaText: b.ctaText || 'Explore Remedy',
            }));

          setSlides(validBanners);
        }
      } catch (e) {
        console.error('Failed to load banners', e);
      } finally {
        setLoaded(true);
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
      {/* If admin uploaded banners exist, show carousel */}
      {slides.length > 0 ? (
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
                {/* Admin Uploaded Banner Image */}
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

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
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
                      i === currentSlide
                        ? 'w-6 sm:w-8 bg-[#D4AF37]'
                        : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Clean branded hero when no banners have been uploaded yet (no fake stock photos) */
        <div className="relative h-[340px] sm:h-[400px] w-full flex items-center justify-center text-center px-4 bg-gradient-to-b from-[#143225] via-[#1B4332] to-[#2D6A4F]">
          <div className="max-w-2xl space-y-3.5 z-10 py-8">
            <div className="inline-flex items-center gap-2 bg-emerald-950/70 border border-emerald-600/50 text-[#D4AF37] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AYUSH Certified Classical Samhita Formulations</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-md">
              Triven Ayurveda
            </h1>
            <p className="text-amber-100 text-xs sm:text-base max-w-lg mx-auto font-medium">
              Pure classical remedies prepared according to Charaka & Sushruta Samhita with wild-harvested Himalayan botanicals.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/products"
                className="bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* The Amazon-style Gradient Bleed into Overlapping Cards */}
      <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/85 to-transparent pointer-events-none z-10" />
    </div>
  );
}
