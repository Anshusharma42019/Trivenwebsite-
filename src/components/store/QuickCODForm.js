'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Truck,
  Banknote,
  PhoneCall,
  MessageCircle,
  ArrowRight,
  Lock,
} from 'lucide-react';

const COMMON_DISEASES = [
  {
    id: 'piles',
    label: 'बवासीर / Piles (मस्सा)',
    title: 'बवासीर / Piles',
    subtitle: 'खूनी व बादी बवासीर, मस्सा, दर्द',
    icon: '🩸',
  },
  {
    id: 'migraine',
    label: 'माइग्रेन / Migraine (सिरदर्द)',
    title: 'माइग्रेन / Migraine',
    subtitle: 'आधासीसी, पुराना तेज सिरदर्द',
    icon: '🧠',
  },
];

export default function QuickCODForm({
  productName = '',
  initialDisease = '',
  source = 'website_ad_form',
  compact = false,
  onSuccess = null,
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    disease: initialDisease || '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const handleDiseaseSelect = (label) => {
    setFormData((prev) => ({
      ...prev,
      disease: label,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const name = formData.name.trim();
    const rawDigits = formData.phone.replace(/[^0-9]/g, '');
    const phone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
    const diseaseBase = formData.disease.trim();
    const notes = formData.notes.trim();

    if (!name || name.length < 2) {
      setError('कृपया अपना पूरा नाम लिखें (Please enter your name)');
      return;
    }

    if (!phone || phone.length !== 10) {
      setError('कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें (Valid 10-digit mobile required)');
      return;
    }

    if (!diseaseBase) {
      setError('कृपया बीमारी चुनें (बवासीर या माइग्रेन)');
      return;
    }

    const fullDisease = notes ? `${diseaseBase} (${notes})` : diseaseBase;

    setLoading(true);

    try {
      const res = await fetch('/api/quick-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          disease: fullDisease,
          productName: productName || 'Direct COD Order / Consultation',
          source,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit request');
      }

      // Track Meta Pixel Lead event for ad campaigns
      if (typeof window !== 'undefined' && window.fbq) {
        try {
          window.fbq('track', 'Lead', {
            content_name: productName || fullDisease,
            currency: 'INR',
            value: 0,
          });
        } catch (fbErr) {
          // ignore tracking error
        }
      }

      setSubmittedData({
        name,
        phone,
        disease: fullDisease,
      });

      if (onSuccess) {
        onSuccess(json.data);
      }
    } catch (err) {
      setError(err.message || 'सबमिशन में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      name: '',
      phone: '',
      disease: initialDisease || '',
      notes: '',
    });
    setError(null);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedData) {
    return (
      <div className="bg-white rounded-3xl sm:rounded-[32px] border-2 border-emerald-500/40 p-6 sm:p-10 shadow-2xl text-center space-y-5 animate-in fade-in duration-300">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-emerald-400/40">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cash on Delivery (COD) आर्डर दर्ज हुआ</span>
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
            धन्यवाद, {submittedData.name} जी!
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            आपका अनुरोध सफलतापूर्वक दर्ज हो गया है। हमारे वरिष्ठ आयुर्वेदाचार्य (वैद्य जी) आपके नंबर{' '}
            <strong className="text-stone-900 font-bold">+91 {submittedData.phone}</strong> पर जल्द ही संपर्क करेंगे।
          </p>
        </div>

        {/* Highlight Details Box */}
        <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 sm:p-5 text-left text-xs space-y-2.5 max-w-md mx-auto shadow-xs">
          <div className="flex justify-between items-center border-b border-stone-200/80 pb-2">
            <span className="text-stone-500 font-medium">बीमारी / समस्या:</span>
            <span className="text-stone-900 font-bold bg-amber-100/80 px-2 py-0.5 rounded text-amber-900">
              {submittedData.disease}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-stone-200/80 pb-2">
            <span className="text-stone-500 font-medium">भुगतान का तरीका:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Cash on Delivery (घर पहुंचने पर नकद)</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500 font-medium">डिलीवरी समय:</span>
            <span className="text-stone-900 font-bold flex items-center gap-1">
              <Truck className="w-4 h-4 text-[#C5A059]" />
              <span>4 से 5 दिन में आपके पते पर</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="tel:+917309523829"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F1D36] hover:bg-[#162238] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md min-h-[46px]"
          >
            <PhoneCall className="w-4 h-4 text-[#D4AF37]" />
            <span>सीधे वैद्य जी को कॉल करें (+91 73095 23829)</span>
          </a>

          <a
            href={`https://wa.me/917309523829?text=${encodeURIComponent(
              `नमस्ते त्रिवेण आयुर्वेद, मेरा नाम ${submittedData.name} है। मुझे ${submittedData.disease} के लिए COD आर्डर और सलाह चाहिए।`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md min-h-[46px]"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>व्हाट्सएप पर बात करें</span>
          </a>
        </div>

        <div>
          <button
            onClick={handleReset}
            className="text-stone-500 hover:text-stone-800 text-xs underline cursor-pointer mt-2"
          >
            एक और अनुरोध दर्ज करें (Submit Another)
          </button>
        </div>
      </div>
    );
  }

  // ULTRA-PROFESSIONAL 3-FIELD HIGH-CONVERSION FORM (PILES & MIGRAINE ONLY)
  return (
    <div
      className={`bg-white rounded-3xl sm:rounded-[32px] border-2 border-[#D4AF37]/45 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden ${
        compact ? 'p-4 sm:p-6' : 'p-5 sm:p-8 md:p-9'
      }`}
    >
      {/* Form Top Brand Header */}
      <div className="text-center space-y-1.5 pb-4 sm:pb-5 border-b border-stone-100">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs">
          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Cash on Delivery (COD) उपलब्ध</span>
        </div>
        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
          घर बैठे आयुर्वेदिक दवा मंगवाएं
        </h3>
        <p className="text-stone-500 text-xs sm:text-sm font-medium max-w-md mx-auto leading-relaxed">
          सिर्फ <strong>नाम, नंबर और बीमारी</strong> चुनें — बाकी विवरण हमारे वैद्य जी फोन पर पूछ लेंगे!
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 space-y-4 sm:space-y-5">
        
        {/* ================= 1. NAME FIELD ================= */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-stone-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C5A059]" />
              <label htmlFor="quick-name">1. आपका नाम (Full Name) *</label>
            </span>
            <span className="text-[10px] text-stone-400 font-semibold uppercase">जरूरी</span>
          </div>
          <div className="relative">
            <input
              id="quick-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="उदा. राहुल शर्मा / Rajesh Kumar"
              className="w-full px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-stone-300 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/15 outline-none text-xs sm:text-sm font-medium transition-all bg-stone-50/50 hover:bg-white focus:bg-white shadow-2xs text-stone-900"
            />
          </div>
        </div>

        {/* ================= 2. NUMBER FIELD ================= */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-stone-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
              <label htmlFor="quick-phone">2. मोबाइल नंबर (Mobile Number) *</label>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              10 अंक
            </span>
          </div>
          <div className="flex rounded-xl sm:rounded-2xl border border-stone-300 focus-within:border-[#C5A059] focus-within:ring-4 focus-within:ring-[#C5A059]/15 overflow-hidden transition-all bg-stone-50/50 hover:bg-white focus-within:bg-white shadow-2xs">
            <span className="inline-flex items-center px-3.5 bg-stone-100 text-stone-800 text-xs sm:text-sm font-bold border-r border-stone-200 shrink-0 select-none">
              🇮🇳 +91
            </span>
            <input
              id="quick-phone"
              type="tel"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setFormData({ ...formData, phone: val });
              }}
              placeholder="98765 43210"
              className="w-full px-4 py-3 sm:py-3.5 outline-none text-xs sm:text-sm font-medium bg-transparent text-stone-900"
            />
          </div>
          <span className="text-[10px] text-stone-400 flex items-center gap-1 pl-1">
            <Lock className="w-3 h-3 text-stone-400" />
            <span>आपका नंबर पूरी तरह सुरक्षित व 100% गोपनीय रहेगा।</span>
          </span>
        </div>

        {/* ================= 3. BIMARI FIELD: ONLY PILES & MIGRAINE ================= */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-stone-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#C5A059]" />
              <label>3. अपनी बीमारी चुनें (Select Disease) *</label>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              1-क्लिक में चुनें
            </span>
          </div>

          {/* TWO PROMINENT HIGH-CONVERSION CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {COMMON_DISEASES.map((d) => {
              const isSelected = formData.disease === d.label;
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => handleDiseaseSelect(d.label)}
                  className={`p-3.5 sm:p-4 rounded-2xl transition-all flex items-center justify-between cursor-pointer border-2 text-left ${
                    isSelected
                      ? 'bg-[#0F1D36] text-[#F3E5AB] border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-lg scale-[1.01]'
                      : 'bg-stone-50 hover:bg-stone-100/90 text-stone-800 border-stone-200/90 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl shrink-0">{d.icon}</span>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold leading-tight">
                        {d.title}
                      </div>
                      <div
                        className={`text-[11px] leading-tight mt-0.5 ${
                          isSelected ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {d.subtitle}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F1D36]'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 fill-current text-[#0F1D36]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional notes / details */}
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="लक्षण या कोई अतिरिक्त विवरण (उदा. कितने समय से समस्या है)... [वैकल्पिक]"
            className="w-full px-4 py-2 sm:py-2.5 rounded-xl border border-stone-300 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/15 outline-none text-xs font-medium transition-all bg-stone-50/50 hover:bg-white focus:bg-white shadow-2xs text-stone-900 mt-2"
          />
        </div>

        {/* ================= BIG POWERFUL CTA BUTTON ================= */}
        <div className="pt-2 sm:pt-3">
          <button
            type="submit"
            disabled={loading}
            className="group w-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] hover:from-[#F0CA50] hover:to-[#D4AF37] active:scale-[0.99] text-[#0F1D36] font-black py-4 px-6 rounded-2xl text-sm sm:text-base transition-all shadow-[0_6px_25px_rgba(212,175,55,0.45)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.6)] flex items-center justify-center gap-2.5 cursor-pointer border-2 border-[#D4AF37]/80 min-h-[52px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#0F1D36]" />
                <span>आर्डर दर्ज हो रहा है...</span>
              </>
            ) : (
              <>
                <Banknote className="w-5 h-5 text-[#0F1D36] group-hover:scale-110 transition-transform" />
                <span>Cash on Delivery (COD) आर्डर बुक करें</span>
                <ArrowRight className="w-5 h-5 text-[#0F1D36] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <p className="text-[11px] text-center text-stone-500 font-medium mt-2">
            दवा घर पहुंचने पर ही भुगतान करें • पूरे भारत में 100% मुफ़्त एक्सप्रेस डिलीवरी
          </p>
        </div>

        {/* ================= 3 CLEAN TRUST BADGES ================= */}
        <div className="pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] text-stone-600">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-50/70 border border-stone-200/60">
            <Banknote className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="font-bold text-stone-900 leading-tight">नकद भुगतान (COD)</span>
            <span className="text-[9px] text-stone-500">घर पहुंचने पर ही दें</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-50/70 border border-stone-200/60">
            <Truck className="w-4 h-4 text-[#C5A059] mb-1" />
            <span className="font-bold text-stone-900 leading-tight">4-5 दिन में डिलीवरी</span>
            <span className="text-[9px] text-stone-500">पूरे भारत में मुफ़्त</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-50/70 border border-stone-200/60">
            <ShieldCheck className="w-4 h-4 text-[#0F1D36] mb-1" />
            <span className="font-bold text-stone-900 leading-tight">100% आयुर्वेदिक</span>
            <span className="text-[9px] text-stone-500">AYUSH प्रमाणित</span>
          </div>
        </div>

      </form>
    </div>
  );
}
