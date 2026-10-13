import './globals.css';
import Script from 'next/script';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

export const metadata = {
  title: 'Triven Ayurveda | Pure Classical Vedic Formulations',
  description:
    'Discover authentic AYUSH-certified classical Ayurvedic medicines, herbal oils, rasayanas, and wellness supplements crafted according to traditional Samhitas.',
  keywords: 'Ayurveda, Ayurvedic medicine, Ashwagandha, Bhringraj oil, Triphala, Shilajit, AYUSH, herbal remedies India',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-800 antialiased selection:bg-ayur-200 selection:text-ayur-900 pb-16 md:pb-0">
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
