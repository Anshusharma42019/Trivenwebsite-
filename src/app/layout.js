import './globals.css';
import Script from 'next/script';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2523] font-sans antialiased selection:bg-[#C5A059]/25 selection:text-[#0F1D36] pb-20 md:pb-0">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
