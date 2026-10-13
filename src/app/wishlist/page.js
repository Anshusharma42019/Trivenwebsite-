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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Amazon Wishlist Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-4">
          <Link href="/" className="hover:text-[#1B4332] hover:underline">
            Home
          </Link>
          <span>›</span>
          <Link href="/account" className="hover:text-[#1B4332] hover:underline">
            Your Account
          </Link>
          <span>›</span>
          <span className="text-stone-800 font-semibold">Your Wish List</span>
        </div>

        {/* Amazon Wishlist Header Layout */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Your Wish List
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                  <Lock className="w-3 h-3" /> Private List
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Curated by <strong className="text-stone-800">{user?.name || 'Vedic Enthusiast'}</strong> • {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShareList}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-stone-500" />
                <span>{shareCopied ? 'Link Copied! ✓' : 'Send list to others'}</span>
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
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
                />
              </div>

              <div className="text-xs text-stone-500">
                Filter & Sort: <strong className="text-stone-800">Date Added (Newest)</strong>
              </div>
            </div>
          )}
        </div>

        {/* Wishlist Items List */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-2xl mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Your Wish List is currently empty
            </h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Explore classical Ayurvedic single herbs, rasayanas, and oils. Click the heart icon on any formulation to save it for later review or gifting.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md"
              >
                <span>Explore Today's Deals & Bestsellers</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
            No items matched "{searchTerm}".
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-xs hover:border-stone-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-start gap-4 flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 block"
                  >
                    <img
                      src={
                        item.images && item.images[0]
                          ? item.images[0]
                          : 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=300'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </Link>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-serif font-bold text-stone-900 hover:text-[#1B4332] text-sm sm:text-base line-clamp-2"
                    >
                      {item.name}
                    </Link>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                        ✓ In Stock
                      </span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-500 text-[11px]">
                        {item.dosageForm || 'Classical'} • {item.netQuantity || 'Standard Pack'}
                      </span>
                    </div>

                    {/* Amazon Prime Badge */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] font-black italic text-[#1B4332]">
                        triven<span className="text-[#D4AF37]">prime</span>
                      </span>
                      <span className="text-[11px] text-stone-500">
                        FREE Delivery by <strong>Tomorrow</strong>
                      </span>
                    </div>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xs font-medium text-stone-500">₹</span>
                      <span className="font-serif text-lg font-black text-stone-900">
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
                <div className="w-full sm:w-56 shrink-0 flex flex-col gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-stone-900 font-bold py-2.5 px-4 rounded-full text-xs shadow-xs transition-colors flex items-center justify-center gap-2 border border-[#FCD200]"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>

                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="w-full text-stone-500 hover:text-red-600 text-xs py-1.5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Amazon Recommendations Strip */}
        <div className="mt-12 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <h3 className="font-serif font-bold text-stone-900 text-base mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Customers who saved items in Wish List also viewed</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                title: 'Organic Ashwagandha KSM-66',
                price: '₹599',
                mrp: '₹799',
                img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=300',
                slug: 'organic-ashwagandha-ksm-66-churna',
              },
              {
                title: 'Classical Mahabhringraj Taila',
                price: '₹349',
                mrp: '₹449',
                img: 'https://images.unsplash.com/photo-1608248597359-0012217c4639?auto=format&fit=crop&q=80&w=300',
                slug: 'organic-ashwagandha-ksm-66-churna',
              },
              {
                title: 'Himalayan Shilajit Resin 20g',
                price: '₹1,449',
                mrp: '₹1,899',
                img: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=300',
                slug: 'organic-ashwagandha-ksm-66-churna',
              },
              {
                title: 'Brahmi Rasayana Brain Tonic',
                price: '₹420',
                mrp: '₹520',
                img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=300',
                slug: 'organic-ashwagandha-ksm-66-churna',
              },
            ].map((p, idx) => (
              <Link
                key={idx}
                href={`/products/${p.slug}`}
                className="group border border-stone-100 rounded-xl p-3 hover:border-stone-300 hover:shadow-xs transition-all flex flex-col"
              >
                <div className="aspect-square rounded-lg bg-stone-50 overflow-hidden mb-2">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="font-bold text-xs text-stone-900 group-hover:text-[#1B4332] line-clamp-1 mb-1">
                  {p.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-auto text-xs">
                  <span className="font-bold text-[#1B4332]">{p.price}</span>
                  <span className="text-[10px] text-stone-400 line-through">{p.mrp}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
