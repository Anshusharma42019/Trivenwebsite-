import './globals.css';
import Script from 'next/script';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import FloatingQuickOrderButton from '@/components/store/FloatingQuickOrderButton';
import ExitIntentModal from '@/components/store/ExitIntentModal';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: 'Triven Ayurveda | Pure Classical Vedic Formulations',
  description:
    'Discover authentic AYUSH-certified classical Ayurvedic medicines, herbal oils, rasayanas, and wellness supplements crafted according to traditional Samhitas.',
  keywords: 'Ayurveda, Ayurvedic medicine, Ashwagandha, Bhringraj oil, Triphala, Shilajit, AYUSH, herbal remedies India',
};

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '921140677629160';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2523] font-sans antialiased selection:bg-[#C5A059]/25 selection:text-[#0F1D36] pb-20 md:pb-0">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <FloatingQuickOrderButton />
              <ExitIntentModal />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>

        {/* --- Meta Pixel (Facebook & Instagram Ads) --- */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt="Meta Pixel"
          />
        </noscript>
        {/* --- End Meta Pixel --- */}

        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
