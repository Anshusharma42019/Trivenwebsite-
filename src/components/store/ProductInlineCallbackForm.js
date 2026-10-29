'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Truck,
  Banknote,
  MessageCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';

export default function ProductInlineCallbackForm({
  product,
  productCondition = 'general',
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Derive condition name
  const diseaseLabel =
    productCondition === 'piles'
      ? 'बवासीर / Piles (मस्सा)'
      : productCondition === 'migraine'
      ? 'माइग्रेन / Migraine (सिरदर्द)'
      : product?.name || 'Ayurvedic Wellness Consultation';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const name = formData.name.trim();
    const rawDigits = formData.phone.replace(/[^0-9]/g, '');
    const phone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

    if (!name || name.length < 2) {
      setError('कृपया अपना पूरा नाम लिखें (Enter your name)');
      return;
    }

    if (!phone || phone.length !== 10) {
      setError('कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/quick-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          disease: diseaseLabel,
          productName: product?.name || 'Product Inline Callback',
          source: 'product_inline_callback',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'सबमिशन में त्रुटि हुई');

      // Facebook Pixel Lead event
      if (typeof window !== 'undefined' && window.fbq) {
        try {
          window.fbq('track', 'Lead', {
            content_name: product?.name || 'Product Callback',
            currency: 'INR',
            value: 0,
          });
        } catch (fbErr) {}
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-[#0B1527] to-[#12233F] text-white p-5 rounded-2xl border-2 border-emerald-500/60 shadow-lg text-center space-y-3 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
            ✓ रिक्वेस्ट दर्ज हुई
          </span>
          <h4 className="font-serif font-bold text-base text-white">
            धन्यवाद, {formData.name}!
          </h4>
          <p className="text-stone-300 text-xs leading-relaxed">
            हमारे वरिष्ठ आयुर्वेदाचार्य (वैद्य जी) आपके नंबर <strong>+91 {formData.phone}</strong> पर अगले <strong>15 मिनट</strong> में कॉल करेंगे।
          </p>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row gap-2">
          <a
            href="tel:+917309523829"
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0F1D36] font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>सीधे कॉल करें (+91 73095 23829)</span>
          </a>
          <a
            href={`https://wa.me/917309523829?text=${encodeURIComponent(
              `नमस्ते, मुझे ${product?.name || 'दवा'} के बारे में परामर्श और आर्डर की जानकारी चाहिए। नाम: ${formData.name}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>व्हाट्सएप पर बात करें</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#081223] via-[#0E1E38] to-[#122543] text-white p-4 sm:p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-xl space-y-3.5">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-[#F3E5AB]" />
            <span>मुफ़्त डॉक्टर सलाह (Free Callback)</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>15 मिनट में कॉल</span>
          </span>
        </div>

        <h4 className="font-serif text-sm sm:text-base font-extrabold text-white leading-snug">
          दवा या खुराक समझ नहीं आ रही? सीधे डॉक्टर से बात करें
        </h4>
        <p className="text-stone-300 text-[11px] leading-tight">
          सिर्फ <strong>नाम व मोबाइल नंबर</strong> डालें — हमारे आयुर्वेदाचार्य आपको फ्री कॉल कर उचित खुराक समझाएंगे व COD आर्डर बुक कर देंगे।
        </p>
      </div>

      {error && (
        <div className="p-2 bg-red-900/50 border border-red-500/50 rounded-xl text-[11px] text-red-200 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Name Field */}
        <div>
          <label className="block text-[11px] font-bold text-stone-200 mb-1">
            आपका नाम (Full Name) *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="जैसे: राहुल शर्मा / Rajesh Sharma"
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 text-white placeholder-stone-400 text-xs outline-none transition-all"
            />
          </div>
        </div>

        {/* Mobile Number Field */}
        <div>
          <label className="block text-[11px] font-bold text-stone-200 mb-1">
            मोबाइल नंबर (Mobile Number) *
          </label>
          <div className="flex rounded-xl overflow-hidden border border-white/20 focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/30 bg-white/10 transition-all">
            <span className="inline-flex items-center px-2.5 bg-white/10 text-stone-300 text-xs font-bold border-r border-white/15 select-none">
              🇮🇳 +91
            </span>
            <input
              type="tel"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setFormData({ ...formData, phone: val });
              }}
              placeholder="98765 43210"
              className="w-full px-3 py-2 text-white placeholder-stone-400 text-xs outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Requested Callback / Book Consultation CTA Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] hover:from-[#F0CA50] hover:to-[#D4AF37] text-[#0F1D36] font-black py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-[0_4px_16px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0F1D36]" />
                <span>रिक्वेस्ट सबमिट हो रही है...</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4 text-[#0F1D36]" />
                <span>Request Callback • Book Consultation ➔</span>
              </>
            )}
          </button>
        </div>

        {/* Trust Points */}
        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-300">
          <span className="flex items-center gap-1">
            <Banknote className="w-3 h-3 text-emerald-400" />
            <span>100% Cash on Delivery (COD)</span>
          </span>
          <span className="flex items-center gap-1 text-[#F3E5AB]">
            <PhoneCall className="w-3 h-3" />
            <a href="tel:+917309523829" className="hover:underline">
              हेल्पलाइन: +91 73095 23829
            </a>
          </span>
        </div>
      </form>
    </div>
  );
}

