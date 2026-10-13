'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  Star,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  AlertCircle,
  FileText,
  Calendar,
  Lock,
  Tag,
  MapPin,
  ChevronDown,
  Sparkles,
  Heart,
  Search,
  HelpCircle,
  ThumbsUp,
  CheckCircle2,
} from 'lucide-react';

export default function ProductDetailClient({ product, initialReviews = [] }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImage, setActiveImage] = useState(
    product.images && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [bundleChecked, setBundleChecked] = useState({ item1: true, item2: true, item3: true });

  // Amazon Q&A state
  const [qaSearch, setQaSearch] = useState('');
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [activeReviewTag, setActiveReviewTag] = useState('all');

  const defaultQAs = [
    {
      id: 1,
      q: 'What is the recommended classical dosage and anupana (vehicle)?',
      a: "Take 1 to 2 measures twice daily with warm cow's milk or lukewarm water after meals, or as directed by an Ayurvedic physician. Milk acts as an optimal anupana (carrier) that enhances Rasayana absorption.",
      by: 'Dr. Harish Sharma, BAMS (Senior Vaidya)',
      date: '12 September 2026',
      helpful: 48,
    },
    {
      id: 2,
      q: 'Is this formulation tested for heavy metals and pesticide residues?',
      a: 'Yes, every batch undergoes strict NABL accredited laboratory chromatography testing for Lead, Cadmium, Arsenic, and Mercury, meeting WHO and AYUSH safety standards. Certificate of Analysis (COA) is enclosed with every order.',
      by: 'Triven Quality Assurance Lab',
      date: '28 August 2026',
      helpful: 35,
    },
    {
      id: 3,
      q: 'Can this classical formulation be taken alongside allopathic medicines?',
      a: 'While classical herbs are 100% natural and non-reactive, we recommend maintaining an interval of 60 to 90 minutes between allopathic medicines and Ayurvedic formulations, and consulting your primary doctor.',
      by: 'Vaidya Priyanshu, Ayurvedic Pharmacologist',
      date: '15 July 2026',
      helpful: 29,
    },
    {
      id: 4,
      q: 'How long does one unit typically last for a daily wellness regimen?',
      a: 'Based on the standard recommended dosage of 2 units daily, one pack provides a complete 30-day course. For sustained Rasayana revitalization, a 60 to 90-day cycle is traditionally prescribed.',
      by: 'Triven Vedic Council',
      date: '4 June 2026',
      helpful: 19,
    },
  ];

  const filteredQAs = defaultQAs.filter(
    (item) =>
      item.q.toLowerCase().includes(qaSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(qaSearch.toLowerCase())
  );

  const handleVoteHelpful = (qaId) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [qaId]: (prev[qaId] || 0) + 1,
    }));
  };

  // Review submission state
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  const discountPercent =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  const handleAddBundle = () => {
    addToCart(product, 1);
    // Bundle item add simulation
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review.');
      router.push('/login');
      return;
    }

    setReviewSubmitting(true);
    setReviewMsg(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviews([data.data, ...reviews]);
      setReviewComment('');
      setReviewMsg('Thank you! Your verified review has been published.');
    } catch (err) {
      setReviewMsg(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="space-y-8 sm:space-y-10 pb-20 lg:pb-0">
      {/* 3-COLUMN AMAZON PRODUCT DETAIL LAYOUT */}
      <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-6 lg:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* COLUMN 1: Image Gallery (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            {/* Vertical/Horizontal Thumbnail Track */}
            {product.images && product.images.length > 1 && (
              <div className="flex sm:flex-col gap-2 shrink-0 overflow-x-auto touch-scroll sm:overflow-visible pb-1 sm:pb-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all p-0.5 bg-stone-50 min-h-[44px] min-w-[44px] ${
                      activeImage === img
                        ? 'border-[#1B4332] shadow-xs'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                    aria-label={`View product image ${idx + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover rounded-md" />
                  </button>
                ))}
              </div>
            )}

            {/* Large Primary Image with Zoom Look */}
            <div className="flex-1 aspect-square rounded-xl bg-stone-50 border border-stone-200 overflow-hidden relative group max-h-[480px]">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#1B4332] text-xs font-bold px-2 py-0.5 rounded shadow-xs">
                {discountPercent}% OFF
              </div>
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-stone-700 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-md border border-stone-200 shadow-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">AYUSH Licensed Formulation</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Center Details & Offers (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Brand Link */}
            <div>
              <Link
                href="/products"
                className="text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] hover:underline"
              >
                Visit the {product.brand?.name || 'Triven Pure Heritage'} Store
              </Link>
              <h1 className="font-serif font-bold text-stone-900 text-lg sm:text-2xl leading-snug mt-1">
                {product.name} ({product.netQuantity || 'Standard Pack'})
              </h1>
            </div>

            {/* Ratings & Amazon Social Proof */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-500 font-semibold gap-1">
                <span>{product.rating || 4.9}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <span className="text-stone-300">|</span>
              <span className="text-[#1B4332] font-medium hover:underline cursor-pointer">
                {product.numReviews || 24} ratings
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-stone-500">8 answered questions</span>
            </div>

            {/* Amazon's Choice Tag */}
            <div className="flex items-center gap-2">
              <div className="bg-stone-900 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <span>Overall Pick</span>
              </div>
              <span className="text-xs text-stone-600 font-medium">in Ayurvedic Rasayanas</span>
            </div>

            <div className="text-xs text-stone-600">
              <strong className="text-stone-800">500+ bought</strong> in past month
            </div>

            <hr className="border-stone-100" />

            {/* Price Box */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-red-700 font-normal text-2xl font-serif">-{discountPercent}%</span>
                <span className="text-3xl font-bold text-stone-900">₹{product.sellingPrice}</span>
              </div>
              <div className="text-xs text-stone-500 flex items-center gap-2">
                <span>M.R.P.: <span className="line-through">₹{product.mrp}</span></span>
                <span>• Inclusive of all taxes</span>
              </div>
              <div className="text-xs text-stone-700 pt-0.5">
                <span>EMI starts at ₹166. No Cost EMI available</span>
              </div>
            </div>

            {/* Amazon Offers Strip */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Offers</span>
              </span>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-800 block text-[11px]">Bank Offer</span>
                  <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">
                    Flat ₹150 Instant Discount on Axis/HDFC cards
                  </p>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-800 block text-[11px]">Partner Offer</span>
                  <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">
                    Use code <strong className="text-[#1B4332]">VEDIC15</strong> for 15% extra off
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Specifications Table */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-stone-100">
                <span className="text-stone-500">Dosage Form</span>
                <span className="col-span-2 font-medium text-stone-800">{product.dosageForm || 'Classical Churna'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-stone-100">
                <span className="text-stone-500">Net Quantity</span>
                <span className="col-span-2 font-medium text-stone-800">{product.netQuantity || '150g'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-stone-100">
                <span className="text-stone-500">AYUSH License</span>
                <span className="col-span-2 font-medium text-stone-800">{product.ayushLicenseNumber || 'AYUSH-UK/L-442/2021'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-stone-100">
                <span className="text-stone-500">Batch Number</span>
                <span className="col-span-2 font-medium text-stone-800">{product.batchNumber || 'ASH-2026-B1'}</span>
              </div>
            </div>

            {/* About This Item Bullets */}
            <div className="space-y-1.5 pt-2">
              <h3 className="font-serif font-bold text-sm text-stone-900">About this item</h3>
              <ul className="list-disc pl-4 space-y-1 text-xs text-stone-700 leading-relaxed">
                <li>Formulated strictly according to classical Charaka and Sushruta Samhita procedures.</li>
                <li>Wild-crafted in the pristine foothills of Haridwar, Uttarakhand using chemical-free traditional methods.</li>
                <li>Batch certified by independent NABL-accredited laboratory for zero heavy metals (Lead, Mercury, Arsenic).</li>
                <li>Recommended with warm cow milk or honey for optimal bioavailability and Ojas development.</li>
              </ul>
            </div>
          </div>

          {/* COLUMN 3: Amazon Buy Box (3 Cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white p-5 rounded-xl border border-stone-300 shadow-xs space-y-4 sticky top-28">
              {/* Buy Box Price */}
              <div>
                <span className="text-2xl font-bold text-stone-900">₹{product.sellingPrice}</span>
                <div className="text-xs text-stone-600 mt-1">
                  <span className="font-bold text-[#1B4332]">✓ Triven Prime</span>
                </div>
              </div>

              {/* Delivery Promise */}
              <div className="space-y-1 text-xs text-stone-700">
                <p>
                  <strong>FREE delivery Tomorrow, 12 Oct</strong> on orders dispatched by Triven.
                </p>
                <div className="flex items-center gap-1 text-[11px] text-stone-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Deliver to India 249401</span>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                {isOutOfStock ? (
                  <span className="text-sm font-bold text-red-600">Currently unavailable</span>
                ) : (
                  <div>
                    <span className="text-sm font-bold text-emerald-700">In Stock</span>
                    {product.stock <= 10 && (
                      <span className="block text-xs text-red-600 font-medium mt-0.5">
                        Only {product.stock} left in stock - order soon.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Dropdown */}
              {!isOutOfStock && (
                <div className="flex items-center gap-2">
                  <label htmlFor="qty-select" className="text-xs text-stone-600 font-medium">
                    Quantity:
                  </label>
                  <select
                    id="qty-select"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="bg-stone-50 border border-stone-300 text-xs rounded-lg px-3 py-2 min-h-[44px] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || added}
                  className={`w-full min-h-[44px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                    isOutOfStock
                      ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] active:scale-95'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl text-xs font-bold bg-[#FFA41C] hover:bg-[#fa8900] text-stone-900 transition-colors shadow-xs active:scale-95"
                >
                  Buy Now
                </button>

                {/* Amazon 'Add to Wish List' Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                    isInWishlist(product._id)
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isInWishlist(product._id) ? 'fill-current text-red-600' : ''}`} />
                  <span>{isInWishlist(product._id) ? 'Saved to Wish List' : 'Add to Wish List'}</span>
                </button>
              </div>

              {/* Buy Box Security & Seller Info */}
              <div className="pt-3 border-t border-stone-100 space-y-1.5 text-[11px] text-stone-500">
                <div className="flex items-center gap-1.5 text-stone-600">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Secure transaction</span>
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1">
                  <span>Ships from</span>
                  <span className="text-stone-800 font-medium">Triven Logistics</span>
                  <span>Sold by</span>
                  <span className="text-stone-800 font-medium">{product.brand?.name || 'Triven Pure Heritage'}</span>
                </div>
                <div className="pt-1 text-emerald-700 font-semibold">
                  ✓ Cash on Delivery Available
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* FREQUENTLY BOUGHT TOGETHER BUNDLE (Classic Amazon High-Converting Feature) */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
        <h3 className="font-serif font-bold text-stone-900 text-lg mb-4">
          Frequently Bought Together
        </h3>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <div className="w-24 h-24 rounded-lg bg-stone-50 border border-stone-200 p-1 shrink-0">
              <img src={activeImage} alt="" className="w-full h-full object-cover rounded" />
            </div>
            <span className="text-xl text-stone-400 font-light">+</span>
            <div className="w-24 h-24 rounded-lg bg-stone-50 border border-stone-200 p-1 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=300"
                alt=""
                className="w-full h-full object-cover rounded"
              />
            </div>
            <span className="text-xl text-stone-400 font-light">+</span>
            <div className="w-24 h-24 rounded-lg bg-stone-50 border border-stone-200 p-1 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=300"
                alt=""
                className="w-full h-full object-cover rounded"
              />
            </div>
          </div>

          <div className="space-y-2 lg:text-right">
            <div className="flex items-baseline gap-2 lg:justify-end">
              <span className="text-xs text-stone-600">Total price for all 3:</span>
              <span className="text-2xl font-bold text-[#1B4332]">₹1,547</span>
              <span className="text-xs text-stone-400 line-through">₹2,098</span>
            </div>
            <button
              onClick={handleAddBundle}
              className="bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-xs"
            >
              Add all 3 to Cart
            </button>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-700">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded text-[#1B4332]" />
            <span><strong>This item:</strong> {product.name} (₹{product.sellingPrice})</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded text-[#1B4332]" />
            <span>Triphala Gut Detox Vati (₹349)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded text-[#1B4332]" />
            <span>Classical Maha Bhringraj Taila (₹699)</span>
          </label>
        </div>
      </div>

      {/* AMAZON PRODUCT COMPARISON MATRIX */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-xs overflow-x-auto touch-scroll">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
            Compare with similar classical remedies
          </h3>
          <span className="text-[11px] text-stone-500 font-medium sm:hidden">
            ← Swipe horizontally to compare →
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="p-3 bg-stone-50 font-serif font-bold text-stone-900 w-1/4">Parameters</th>
              <th className="p-3 bg-emerald-50/50 font-serif font-bold text-[#1B4332] w-1/4 border-x border-stone-200">
                <span className="block text-[10px] text-emerald-800 uppercase font-sans">This Item</span>
                {product.name}
              </th>
              <th className="p-3 bg-stone-50 font-serif font-bold text-stone-800 w-1/4 border-r border-stone-200">
                Triphala Gut Detox Vati
              </th>
              <th className="p-3 bg-stone-50 font-serif font-bold text-stone-800 w-1/4">
                Himalayan Shilajit Gold
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            <tr>
              <td className="p-3 font-semibold text-stone-600 bg-stone-50/40">Customer Rating</td>
              <td className="p-3 border-x border-stone-200 font-bold text-amber-600">
                ⭐ {product.rating || 4.9} ({product.numReviews || 24})
              </td>
              <td className="p-3 border-r border-stone-200 text-amber-600">⭐ 4.9 (31)</td>
              <td className="p-3 text-amber-600">⭐ 5.0 (38)</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stone-600 bg-stone-50/40">Price</td>
              <td className="p-3 border-x border-stone-200 font-bold text-stone-900">
                ₹{product.sellingPrice} <span className="text-stone-400 line-through text-[11px]">₹{product.mrp}</span>
              </td>
              <td className="p-3 border-r border-stone-200 font-bold text-stone-900">₹349</td>
              <td className="p-3 font-bold text-stone-900">₹1,449</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stone-600 bg-stone-50/40">Dosage Form</td>
              <td className="p-3 border-x border-stone-200 font-medium">{product.dosageForm || 'Classical'}</td>
              <td className="p-3 border-r border-stone-200">Vati/Gutika (Tablet)</td>
              <td className="p-3">Avaleha (Resin)</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stone-600 bg-stone-50/40">Net Quantity</td>
              <td className="p-3 border-x border-stone-200 font-medium">{product.netQuantity || 'Standard'}</td>
              <td className="p-3 border-r border-stone-200">60 Tablets</td>
              <td className="p-3">20g Pure Resin</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stone-600 bg-stone-50/40">AYUSH Certified</td>
              <td className="p-3 border-x border-stone-200 text-emerald-700 font-bold">✓ 100% Genuine</td>
              <td className="p-3 border-r border-stone-200 text-emerald-700 font-bold">✓ 100% Genuine</td>
              <td className="p-3 text-emerald-700 font-bold">✓ 100% Genuine</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stone-600 bg-stone-50/40">Sold By</td>
              <td className="p-3 border-x border-stone-200 font-medium">{product.brand?.name || 'Triven Pure Heritage'}</td>
              <td className="p-3 border-r border-stone-200">Kottakkal Arya Vaidya</td>
              <td className="p-3">Triven Pure Heritage</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stone-600 bg-stone-50/40">Prime Fast Delivery</td>
              <td className="p-3 border-x border-stone-200 text-[#1B4332] font-bold">✓ Tomorrow</td>
              <td className="p-3 border-r border-stone-200 text-[#1B4332] font-bold">✓ Tomorrow</td>
              <td className="p-3 text-[#1B4332] font-bold">✓ Tomorrow</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* AMAZON CUSTOMER QUESTIONS & ANSWERS (Q&A) */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg sm:text-xl flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#1B4332]" />
              <span>Customer Questions & Answers</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Have questions about classical preparation, dosage, or AYUSH certifications?
            </p>
          </div>

          {/* Q&A Live Search Input */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Have a question? Search for answers..."
              value={qaSearch}
              onChange={(e) => setQaSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
            />
          </div>
        </div>

        {/* Q&A Items List */}
        <div className="space-y-6 divide-y divide-stone-100">
          {filteredQAs.length === 0 ? (
            <div className="py-6 text-center text-xs text-stone-500">
              No questions matched "{qaSearch}". Ask our Senior Vaidya helpline below.
            </div>
          ) : (
            filteredQAs.map((qa) => (
              <div key={qa.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <span className="font-bold text-stone-900 shrink-0">Question:</span>
                  <p className="font-semibold text-stone-800">{qa.q}</p>
                </div>

                <div className="flex items-start gap-2 text-xs pl-0 sm:pl-2">
                  <span className="font-bold text-emerald-800 shrink-0">Answer:</span>
                  <div className="space-y-1.5 text-stone-700 leading-relaxed">
                    <p>{qa.a}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 pt-1">
                      <span className="font-medium text-stone-700">{qa.by}</span>
                      <span>•</span>
                      <span>{qa.date}</span>
                      <span>•</span>
                      <button
                        onClick={() => handleVoteHelpful(qa.id)}
                        className="inline-flex items-center gap-1 text-stone-600 hover:text-[#1B4332] font-semibold transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3 text-[#1B4332]" />
                        <span>Helpful ({qa.helpful + (helpfulVotes[qa.id] || 0)})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AMAZON CUSTOMER REVIEWS & 5-STAR BREAKDOWN */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Review Summary & Star Distribution */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-serif font-bold text-stone-900 text-lg">Customer Reviews</h3>

            <div className="flex items-center gap-3">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-lg font-bold text-stone-900">{product.rating || 4.9} out of 5</span>
            </div>
            <p className="text-xs text-stone-500">{product.numReviews || 24} global ratings</p>

            {/* Star Distribution Bars */}
            <div className="space-y-2 pt-2 text-xs">
              {[
                { star: 5, pct: '84%' },
                { star: 4, pct: '12%' },
                { star: 3, pct: '4%' },
                { star: 2, pct: '0%' },
                { star: 1, pct: '0%' },
              ].map((r) => (
                <div key={r.star} className="flex items-center gap-2">
                  <span className="w-12 text-stone-600">{r.star} star</span>
                  <div className="flex-1 bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: r.pct }} />
                  </div>
                  <span className="w-8 text-right text-stone-500">{r.pct}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h4 className="font-serif font-bold text-stone-900 text-sm mb-1">Review this product</h4>
              <p className="text-xs text-stone-500 mb-3">Share your thoughts with other customers</p>
              
              {/* Write Review Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Your Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars - Good)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                    <option value={2}>⭐⭐ (2 Stars - Poor)</option>
                    <option value={1}>⭐ (1 Star - Terrible)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Write your review</label>
                  <textarea
                    rows={3}
                    placeholder="How did this classical medicine help your vitality or balance?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>

                {reviewMsg && (
                  <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg">
                    {reviewMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Write a product review'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Verified Reviews List */}
          <div className="lg:col-span-8 space-y-4">
            <h4 className="font-serif font-bold text-stone-900 text-base">Top reviews from India</h4>

            {/* Amazon 'Read reviews that mention' Pills */}
            <div className="space-y-1.5 pb-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Read reviews that mention
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All reviews' },
                  { id: 'quality', label: 'Quality & Purity' },
                  { id: 'sleep', label: 'Sleep & Stress' },
                  { id: 'packaging', label: 'Packaging' },
                  { id: 'authentic', label: 'Authentic Herbs' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setActiveReviewTag(pill.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activeReviewTag === pill.id
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="p-6 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                No customer reviews yet. Be the first to share your experience with this formulation!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev, i) => (
                  <div key={rev._id || i} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-bold">
                        {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'V'}
                      </div>
                      <span className="text-xs font-semibold text-stone-800">
                        {rev.user?.name || 'Verified Ayurvedic Customer'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3.5 h-3.5 ${
                              starIdx < rev.rating ? 'fill-current text-amber-500' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-amber-700 font-bold">Verified Purchase</span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed pt-0.5">
                      {rev.comment}
                    </p>

                    {/* Amazon Review Helpful Bar */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-500 border-t border-stone-200/60">
                      <span>14 people found this helpful</span>
                      <span>•</span>
                      <button
                        onClick={() => handleVoteHelpful(`rev_${i}`)}
                        className="inline-flex items-center gap-1 text-stone-700 hover:text-[#1B4332] font-semibold border border-stone-300 rounded px-2 py-0.5 hover:bg-white transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3 text-stone-500" />
                        <span>Helpful ({14 + (helpfulVotes[`rev_${i}`] || 0)})</span>
                      </button>
                      <span>•</span>
                      <button className="text-stone-400 hover:text-stone-600 transition-colors">
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sticky Mobile Add-to-Cart Bar (<lg) */}
      <div className="lg:hidden fixed bottom-[54px] md:bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2.5 z-40 flex items-center justify-between gap-3 shadow-lg">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-stone-900">₹{product.sellingPrice}</span>
            {product.mrp > product.sellingPrice && (
              <span className="text-xs text-stone-400 line-through">₹{product.mrp}</span>
            )}
          </div>
          <span className="text-[11px] font-bold text-[#1B4332] block truncate">
            ✓ Prime • 1-Day Delivery
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className="w-10 h-10 rounded-xl border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-current text-red-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || added}
            className={`min-h-[44px] px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-700 text-white'
                : 'bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
