'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  X,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Gift,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  MessageCircle,
} from 'lucide-react';

const COMMON_DISEASES = [
  { id: 'piles', label: 'बवासीर / Piles (मस्सा)', icon: '🩸' },
  { id: 'migraine', label: 'माइग्रेन / Migraine (सिरदर्द)', icon: '🧠' },
];

export default function ExitIntentModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    disease: 'बवासीर / Piles (मस्सा)',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Do not trigger on admin or success pages
    if (pathname?.startsWith('/admin') || pathname?.includes('/success')) {
      return;
    }

    // Check if already shown in this browser session
    const hasShown = sessionStorage.getItem('triven_exit_modal_shown');
    if (hasShown) return;

    let triggered = false;

    const triggerModal = () => {
      if (triggered) return;
      triggered = true;
      sessionStorage.setItem('triven_exit_modal_shown', 'true');
      setIsOpen(true);
    };

    // 1. Desktop Exit Intent: Mouse leaves via top of window
    const handleMouseLeave = (e) => {
      if (e.clientY <= 15) {
        triggerModal();
      }
    };

    // 2. Mobile Exit Intent: Back button pushState trap
    try {
      window.history.pushState({ exitGuard: true }, '', window.location.href);
    } catch (e) {
      // ignore state error
    }

    const handlePopState = () => {
      if (!triggered) {
        triggerModal();
        try {
          window.history.pushState({ exitGuard: true }, '', window.location.href);
        } catch (e) {}
      }
    };

    // 3. Mobile Fast Scroll Up towards top after browsing
    let maxScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > maxScroll) {
        maxScroll = currentScroll;
      }
      if (maxScroll > 500 && currentScroll < 50) {
        triggerModal();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const name = formData.name.trim();
    const rawDigits = formData.phone.replace(/[^0-9]/g, '');
    const phone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

    if (!name || name.length < 2) {
      setError('कृपया अपना नाम लिखें (Enter Name)');
      return;
    }

    if (!phone || phone.length !== 10) {
      setError('कृपया 10 अंकों का सही मोबाइल नंबर लिखें');
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
          disease: formData.disease,
          productName: 'Exit Intent 10% Discount Offer',
          source: 'exit_intent_popup',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'सबमिशन में त्रुटि हुई');

      // Facebook Pixel Lead tracking
      if (typeof window !== 'undefined' && window.fbq) {
        try {
          window.fbq('track', 'Lead', {
            content_name: 'Exit Intent Callback Request',
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-[#091528] via-[#0E1E38] to-[#091528] text-white rounded-3xl border-2 border-[#D4AF37] shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Gold Gradient Glow Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37]" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3.5 top-5 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-7 space-y-4">
          
          {submitted ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                  <span>10% डिस्काउंट कूपन लॉक हुआ</span>
                </span>
                <h3 className="font-serif text-2xl font-black text-white">
                  धन्यवाद, {formData.name}!
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                  हमारे वरिष्ठ आयुर्वेदाचार्य (वैद्य जी) आपके नंबर <strong>+91 {formData.phone}</strong> पर अगले <strong>15 मिनट</strong> में कॉल करेंगे और आपको 10% विशेष छूट भी देंगे।
                </p>
              </div>

              <div className="p-3 bg-[#060E1A] rounded-2xl border border-[#D4AF37]/30 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-400">समस्या:</span>
                  <span className="text-[#F3E5AB] font-bold">{formData.disease}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">पेमेंट विकल्प:</span>
                  <span className="text-emerald-400 font-bold">Cash on Delivery (COD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">डिलीवरी:</span>
                  <span className="text-stone-200 font-bold">100% मुफ़्त एक्सप्रेस शिपिंग</span>
                </div>
              </div>

              {/* Instant Call / WhatsApp Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href="tel:+917309523829"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0F1D36] font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md"
                >
                  <PhoneCall className="w-4 h-4 text-[#0F1D36]" />
                  <span>सीधे डॉक्टर को कॉल करें</span>
                </a>
                <a
                  href={`https://wa.me/917309523829?text=${encodeURIComponent(
                    `नमस्ते, मैंने 10% डिस्काउंट के लिए रिक्वेस्ट की है। नाम: ${formData.name}, बीमारी: ${formData.disease}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>व्हाट्सएप पर बात करें</span>
                </a>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="text-stone-400 hover:text-white text-xs underline cursor-pointer pt-1"
              >
                विंडो बंद करें (Close)
              </button>
            </div>
          ) : (
            /* ACTIVE EXIT POPUP FORM */
            <>
              {/* Header Badge */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-red-950/80 text-red-300 border border-red-500/40 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide animate-pulse">
                  <span>🛑 रुकिए! विशेष अवसर</span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-black text-white leading-tight">
                  रुकावट के लिए माफ़ी! क्या आपको आर्डर या पेमेंट में कोई दिक्कत आ रही है?
                </h3>

                <div className="p-2.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs font-medium leading-relaxed">
                  🎁 <strong>10% एक्स्ट्रा डिस्काउंट</strong> + हमारे वरिष्ठ आयुर्वेदिक डॉक्टर से <strong>निःशुल्क परामर्श (Free Callback)</strong> पाने के लिए अपना नंबर यहाँ दर्ज करें!
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-900/40 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                
                {/* 1. Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-200 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>आपका नाम (Full Name) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="जैसे: राहुल शर्मा"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 text-white placeholder-stone-400 text-xs sm:text-sm outline-none transition-all"
                  />
                </div>

                {/* 2. Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-200 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>मोबाइल नंबर (10 अंक) *</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
                      डॉक्टर कॉल करेंगे
                    </span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-white/20 focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/30 bg-white/10 transition-all">
                    <span className="inline-flex items-center px-3 bg-white/10 text-stone-300 text-xs font-bold border-r border-white/15 select-none">
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
                      className="w-full px-3.5 py-2.5 text-white placeholder-stone-400 text-xs sm:text-sm outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* 3. Disease Selection (Piles vs Migraine) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-200">
                    बीमारी चुनें (Select Issue) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_DISEASES.map((d) => {
                      const isSelected = formData.disease === d.label;
                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => setFormData({ ...formData, disease: d.label })}
                          className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                            isSelected
                              ? 'bg-[#D4AF37] text-[#0F1D36] border-[#F3E5AB] shadow-md scale-[1.02]'
                              : 'bg-white/5 hover:bg-white/10 text-stone-300 border-white/15'
                          }`}
                        >
                          <span>{d.icon}</span>
                          <span className="truncate">{d.label.split('(')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] hover:from-[#F0CA50] hover:to-[#D4AF37] text-[#0F1D36] font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-[0_4px_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0F1D36]" />
                        <span>सबमिट हो रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 text-[#0F1D36]" />
                        <span>10% डिस्काउंट पाएं & फ्री कॉल बुक करें ➔</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Call Strip */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% Cash on Delivery (COD)</span>
                  </span>
                  <a
                    href="tel:+917309523829"
                    className="text-[#F3E5AB] font-bold hover:underline flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3 text-[#D4AF37]" />
                    <span>कॉल: +91 73095 23829</span>
                  </a>
                </div>

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

