'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Share2,
  Lock,
  Search,
  CheckCircle2,
  Star,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import ProductImage from '@/components/store/ProductImage';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [addedItemIds, setAddedItemIds] = useState([]);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    document.title = 'Your Wish List | Triven Ayurveda';
  }, []);

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
    setAddedItemIds((prev) => [...prev, product._id]);
  };

  const handleShareList = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const filteredItems = wishlist.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2523] selection:bg-[#C5A059]/20 selection:text-[#0F1D36]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Wishlist Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#6E6761] mb-4">
          <Link href="/" className="hover:text-[#C5A059] hover:underline">
            Home
          </Link>
          <span>›</span>
          <Link href="/account" className="hover:text-[#C5A059] hover:underline">
            Your Account
          </Link>
          <span>›</span>
          <span className="text-[#14171F] font-semibold">Your Wish List</span>
        </div>

        {/* Wishlist Header Layout */}
        <div className="bg-white rounded-2xl border border-[#EBE6DD] p-6 mb-8 shadow-luxury">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EBE6DD]">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14171F]">
                  Your Wish List
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] bg-stone-100 text-[#6E6761] px-2 py-0.5 rounded-full font-medium">
                  <Lock className="w-3 h-3" /> Private List
                </span>
              </div>
              <p className="text-xs text-[#6E6761] mt-1">
                Curated by <strong className="text-[#14171F]">{user?.name || 'Vedic Enthusiast'}</strong> • {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShareList}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-[#14171F] hover:bg-stone-50 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-stone-500" />
                <span className="inline-flex items-center gap-1">
                  {shareCopied ? (
                    <>
                      <span>Link Copied!</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </>
                  ) : (
                    'Send list to others'
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Search bar inside Wishlist */}
          {wishlist.length > 0 && (
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative max-w-md w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search this list..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
              </div>

              <div className="text-xs text-[#6E6761]">
                Filter & Sort: <strong className="text-[#14171F]">Date Added (Newest)</strong>
              </div>
            </div>
          )}
        </div>

        {/* Wishlist Items List */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE6DD] p-12 text-center max-w-2xl mx-auto shadow-luxury space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#14171F]">
              Your Wish List is currently empty
            </h2>
            <p className="text-xs text-[#6E6761] max-w-md mx-auto leading-relaxed">
              Explore classical Ayurvedic single herbs, rasayanas, and oils. Click the heart icon on any formulation to save it for later review or gifting.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-98"
              >
                <span>Explore Today's Deals & Bestsellers</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE6DD] p-8 text-center text-xs text-[#6E6761]">
            No items matched "{searchTerm}".
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-[#EBE6DD] p-4 sm:p-6 shadow-luxury hover:border-[#D4AF37]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-start gap-4 flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 block"
                  >
                    <ProductImage
                      src={item.images && item.images[0] ? item.images[0] : null}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </Link>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-serif font-bold text-[#14171F] hover:text-[#C5A059] text-sm sm:text-base line-clamp-2"
                    >
                      {item.name}
                    </Link>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#0F1D36] font-bold text-[11px] bg-[#0F1D36]/5 px-2 py-0.5 rounded-full border border-[#0F1D36]/15 inline-flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>In Stock</span>
                      </span>
                      <span className="text-stone-400">•</span>
                      <span className="text-[#6E6761] text-[11px]">
                        {item.dosageForm || 'Classical'} • {item.netQuantity || 'Standard Pack'}
                      </span>
                    </div>

                    {/* Prime Badge */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] font-black italic text-[#14171F]">
                        triven<span className="text-[#C5A059]">prime</span>
                      </span>
                      <span className="text-[11px] text-[#6E6761]">
                        FREE Delivery by <strong>Tomorrow</strong>
                      </span>
                    </div>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xs font-medium text-stone-500">₹</span>
                      <span className="font-serif text-lg font-black text-[#14171F]">
                        {item.sellingPrice}
                      </span>
                      {item.mrp > item.sellingPrice && (
                        <>
                          <span className="text-xs text-stone-400 line-through">₹{item.mrp}</span>
                          <span className="text-[11px] font-bold text-red-600">
                            Save {Math.round(((item.mrp - item.sellingPrice) / item.mrp) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="w-full sm:w-56 shrink-0 flex flex-col gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#EBE6DD]">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] border border-[#D4AF37]/40 font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>

                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="w-full text-[#6E6761] hover:text-red-600 text-xs py-1.5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}


      </main>

      <Footer />
    </div>
  );
}
