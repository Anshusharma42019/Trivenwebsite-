import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import QuickCODForm from '@/components/store/QuickCODForm';
import {
  ShieldCheck,
  Truck,
  Banknote,
  Award,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Clock,
  Star,
  Users,
} from 'lucide-react';

export const metadata = {
  title: 'Cash on Delivery (COD) दवा आर्डर | Triven Ayurveda',
  description:
    'घर बैठे मंगवाएं 100% शुद्ध आयुर्वेदिक दवाएं। Cash on Delivery (COD) उपलब्ध। सिर्फ नाम, मोबाइल नंबर और बीमारी भरें। मुफ़्त वैद्य परामर्श।',
};

export default function OrderNowPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2523] antialiased">
      <Navbar />

      <main className="flex-1 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* TOP AD BANNER HEADLINE */}
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/50 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>AYUSH Certified Classical Vedic Formulations</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0F1D36] leading-tight">
              घर बैठे आयुर्वेदिक दवा मंगवाएं
              <span className="block text-[#C5A059] text-xl sm:text-3xl mt-1">
                Cash on Delivery (COD) उपलब्ध • पूरे भारत में फ़्री डिलीवरी
              </span>
            </h1>

            <p className="text-stone-600 text-xs sm:text-base font-medium max-w-xl mx-auto">
              कोई अग्रिम भुगतान (Advance Payment) नहीं। दवा घर पहुंचने पर ही पैसे दें। वरिष्ठ आयुर्वेदिक वैद्य जी से निःशुल्क परामर्श।
            </p>
          </div>

          {/* MAIN 2-COLUMN SECTION: FORM + BENEFITS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* LEFT / CENTER: THE 3-FIELD HIGH-CONVERSION COD FORM (7 Cols) */}
            <div className="lg:col-span-7">
              <QuickCODForm source="ad_landing_page" />
            </div>

            {/* RIGHT COLUMN: TRUST & PROOF (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Highlight Card */}
              <div className="bg-gradient-to-br from-[#0F1D36] to-[#1B2A4A] text-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/60 flex items-center justify-center text-[#F3E5AB]">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">
                      100% Cash on Delivery
                    </h3>
                    <p className="text-xs text-[#EADFC9]">
                      पार्सल हाथ में आने के बाद ही नकद भुगतान करें
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-stone-200 border-t border-white/10 pt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>शून्य अग्रिम भुगतान:</strong> ₹0 एडवांस। कोई ऑनलाइन कार्ड या पिन की ज़रूरत नहीं।</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>4 से 5 दिन में होम डिलीवरी:</strong> भारत के 19,000+ पिन कोड्स पर सुरक्षित डिलीवरी।</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>विशेषज्ञ वैद्य जी द्वारा कॉल:</strong> फॉर्म भरते ही वैद्य जी आपसे संपर्क कर उचित खुराक बताएंगे।</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span><strong>100% गोपनीय व सुरक्षित:</strong> आपकी व्यक्तिगत समस्या पूर्णतः सुरक्षित और गोपनीय रहेगी।</span>
                  </div>
                </div>

                {/* Helpline Box */}
                <div className="bg-[#0B1527]/90 rounded-2xl p-3.5 border border-[#D4AF37]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <span className="block text-[10px] text-stone-300">सहायता एवं त्वरित परामर्श:</span>
                      <a href="tel:+917309523829" className="text-sm font-bold text-[#F3E5AB] hover:underline">
                        +91 73095 23829
                      </a>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40">
                    24/7 सक्रिय
                  </span>
                </div>
              </div>

              {/* Trust Badges 2-Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-[#0F1D36] shrink-0" />
                  <div className="leading-tight">
                    <span className="block text-xs font-bold text-stone-900">AYUSH प्रमाणित</span>
                    <span className="text-[10px] text-stone-500">100% शुद्ध जड़ी-बूटियां</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
                  <Award className="w-8 h-8 text-[#C5A059] shrink-0" />
                  <div className="leading-tight">
                    <span className="block text-xs font-bold text-stone-900">NABL टेस्टेड</span>
                    <span className="text-[10px] text-stone-500">शून्य साइड इफेक्ट्स</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
                  <Truck className="w-8 h-8 text-emerald-700 shrink-0" />
                  <div className="leading-tight">
                    <span className="block text-xs font-bold text-stone-900">फ़्री डिलीवरी</span>
                    <span className="text-[10px] text-stone-500">4 से 5 कार्य दिवस</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
                  <Users className="w-8 h-8 text-[#8C5E3C] shrink-0" />
                  <div className="leading-tight">
                    <span className="block text-xs font-bold text-stone-900">1,50,000+</span>
                    <span className="text-[10px] text-stone-500">संतुष्ट भारतीय परिवार</span>
                  </div>
                </div>
              </div>

              {/* Patient Reviews Card */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <h4 className="font-serif font-bold text-xs text-stone-900 uppercase tracking-wider">
                    मरीजों के अनुभव (Verified Feedback)
                  </h4>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">राजेश वर्मा, कानपुर</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        ✓ COD ऑर्डर
                      </span>
                    </div>
                    <p className="text-stone-600 leading-snug">
                      "मैंने सिर्फ नाम, नंबर और बीमारी भरी थी। 20 मिनट में वैद्य जी का कॉल आ गया और 4 दिन में दवा घर आ गई। दवा मिलने के बाद ही पैसे दिए। बहुत बढ़िया सेवा!"
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">सुरेश पाटिल, पुणे</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        ✓ COD ऑर्डर
                      </span>
                    </div>
                    <p className="text-stone-600 leading-snug">
                      "जोड़ों के दर्द के लिए दवा मंगवाई थी। 4 दिन में पार्सल आ गया। कैश ऑन डिलीवरी का विकल्प होने से पूरा भरोसा हो गया।"
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* FREQUENTLY ASKED QUESTIONS */}
          <div className="mt-12 sm:mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                अक्सर पूछे जाने वाले सवाल (FAQ)
              </h3>
              <p className="text-stone-500 text-xs">
                कैश ऑन डिलीवरी (COD) और आर्डर प्रक्रिया से संबंधित आवश्यक जानकारी
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200/80 space-y-1">
                <h5 className="font-bold text-stone-900">1. क्या मुझे पहले कोई पैसा देना होगा?</h5>
                <p className="text-stone-600 leading-relaxed">
                  बिल्कुल नहीं! हमारा 100% Cash on Delivery (COD) सिस्टम है। जब कूरियर बॉय दवा का पार्सल आपके घर लेकर आएगा, तभी आपको नकद या UPI द्वारा भुगतान करना है।
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200/80 space-y-1">
                <h5 className="font-bold text-stone-900">2. दवा मेरे पते पर कितने दिन में पहुंचेगी?</h5>
                <p className="text-stone-600 leading-relaxed">
                  आर्डर कन्फर्म होने के बाद 4 से 5 कार्य दिवसों (4-5 Days) में दवा आपके दिए गए पते पर सुरक्षित रूप से पहुंच जाती है।
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200/80 space-y-1">
                <h5 className="font-bold text-stone-900">3. क्या वैद्य जी से बात करने का कोई शुल्क है?</h5>
                <p className="text-stone-600 leading-relaxed">
                  नहीं, वैद्य जी का परामर्श पूरी तरह से निःशुल्क (FREE) है। वे आपकी बीमारी समझकर उचित आयुर्वेदिक खुराक समझाएंगे।
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200/80 space-y-1">
                <h5 className="font-bold text-stone-900">4. क्या दवा के कोई साइड इफेक्ट्स हैं?</h5>
                <p className="text-stone-600 leading-relaxed">
                  त्रिवेण आयुर्वेद की सभी औषधियां शास्त्रीय चरक व सुश्रुत संहिता के अनुसार शुद्ध हिमालयी जड़ी-बूटियों से निर्मित और AYUSH प्रमाणित हैं। इनका कोई दुष्प्रभाव नहीं है।
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

