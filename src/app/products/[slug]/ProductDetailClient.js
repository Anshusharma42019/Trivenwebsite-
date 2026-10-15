'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ZoomIn,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Play,
  Award,
  Banknote,
  PackageCheck,
} from 'lucide-react';
import ProductImage from '@/components/store/ProductImage';

export default function ProductDetailClient({ product, initialReviews = [], relatedProducts = [] }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const productImages = useMemo(() => {
    let list = [];
    if (Array.isArray(product?.images) && product.images.length > 0) {
      list = product.images.filter(Boolean);
    } else if (product?.image) {
      list = [product.image];
    }

    // If only 1 image exists, automatically derive multi-angle perspectives so the Amazon left rail always has angles to show
    if (list.length === 1 && typeof list[0] === 'string') {
      const base = list[0];
      if (base.includes('cloudinary.com')) {
        return [
          base,
          base.replace('/upload/', '/upload/c_crop,w_0.6,h_1.0,g_west/'),
          base.replace('/upload/', '/upload/c_crop,w_0.6,h_1.0,g_east/'),
          base.replace('/upload/', '/upload/c_crop,w_0.5,h_0.6,g_center/'),
          base.replace('/upload/', '/upload/c_crop,w_0.8,h_0.5,g_north/'),
        ];
      }
      return [base];
    }
    return list;
  }, [product?.images, product?.image]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = productImages[activeImageIndex] || '';

  // Amazon rollover zoom & fullscreen lightbox states
  const [isZooming, setIsZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Triven Pure Heritage`,
          url: url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const formatPricePerUnit = (prod) => {
    if (!prod || !prod.sellingPrice) return '₹19.80 /100 g';
    const net = String(prod.netQuantity || '');
    const numMatch = net.match(/\d+/);
    if (numMatch && Number(numMatch[0]) > 0) {
      const grams = Number(numMatch[0]);
      const per100g = ((prod.sellingPrice / grams) * 100).toFixed(2);
      return `₹${per100g} /100 g`;
    }
    return `₹${(prod.sellingPrice / 1.5).toFixed(2)} /100 g`;
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ x, y });
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, productImages.length - 1)));
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, productImages.length]);
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
          
          {/* COLUMN 1: Image Gallery (5 Cols) - Exact Amazon Reference Layout */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row gap-2.5 sm:gap-3.5 items-start">
            {/* Amazon Left Rail: Vertical Thumbnails (as in reference screenshot) */}
            {productImages.length > 0 && (
              <div className="order-2 sm:order-1 flex sm:flex-col gap-2 shrink-0 overflow-x-auto sm:overflow-y-auto max-h-[520px] touch-scroll pb-1 sm:pb-0 scrollbar-thin">
                {productImages.map((img, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onMouseEnter={() => setActiveImageIndex(idx)}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-[4px] overflow-hidden p-0.5 bg-white min-h-[40px] min-w-[40px] cursor-pointer transition-all ${
                        isActive
                          ? 'border border-[#e77600] ring-1 ring-[#e77600] shadow-[0_0_3px_2px_rgba(228,121,17,0.45)]'
                          : 'border border-stone-300 hover:border-stone-600 hover:shadow-xs'
                      }`}
                      aria-label={`View angle ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Angle ${idx + 1}`}
                        className="w-full h-full object-contain sm:object-cover rounded-[2px]"
                      />
                    </button>
                  );
                })}

                {/* Optional Simulated Video Angle Tile (matching Amazon's 2 VIDEOS tile in screenshot) */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-[4px] overflow-hidden border border-stone-300 p-0.5 bg-stone-900 text-white min-h-[40px] min-w-[40px] cursor-pointer hover:border-stone-600 flex flex-col items-center justify-center transition-all group"
                  title="Watch Product Video / 360 View"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 fill-white text-white translate-x-0.5" />
                  </div>
                  <span className="text-[7px] font-bold tracking-tight text-stone-200 mt-0.5">VIDEO</span>
                </button>
              </div>
            )}

            {/* Amazon Main Stage Image with Rollover Zoom & Fullscreen Lightbox */}
            <div className="order-1 sm:order-2 flex-1 w-full flex flex-col">
              <div
                className="relative aspect-square w-full rounded-lg bg-white border border-stone-200 overflow-hidden group select-none cursor-crosshair shadow-2xs"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setIsLightboxOpen(true)}
              >
                {/* Zoomable Image Container */}
                <div
                  className="w-full h-full flex items-center justify-center transition-transform"
                  style={{
                    transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                    transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                    transition: isZooming ? 'none' : 'transform 0.25s ease-out',
                  }}
                >
                  <ProductImage
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>

                {/* Top Right: Amazon Share Button */}
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                  {shareCopied && (
                    <span className="bg-stone-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                      Link copied!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    className="w-8 h-8 rounded-full bg-white/95 hover:bg-white border border-stone-200 shadow-xs flex items-center justify-center text-stone-700 hover:text-stone-900 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Share this product"
                    aria-label="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Previous / Next Angle Arrow Overlays */}
                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-105 active:scale-95 cursor-pointer"
                      aria-label="Previous angle"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-105 active:scale-95 cursor-pointer"
                      aria-label="Next angle"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Amazon "Roll over to zoom" hint */}
                <div
                  className={`absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-1 rounded shadow-xs flex items-center gap-1 pointer-events-none transition-opacity duration-200 z-10 ${
                    isZooming ? 'opacity-0' : 'opacity-85'
                  }`}
                >
                  <ZoomIn className="w-3 h-3 text-[#FFA41C]" />
                  <span className="hidden sm:inline">Roll over image to zoom in</span>
                  <span className="sm:hidden">Tap to enlarge</span>
                </div>
              </div>

              {/* Centered Amazon Link directly below image: "Click to see full view" */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="w-full text-center mt-2.5 text-xs text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer font-normal block transition-colors"
              >
                Click to see full view
              </button>
            </div>
          </div>

          {/* COLUMN 2: Center Details & Offers (4 Cols) - Exact Amazon Reference */}
          <div className="lg:col-span-4 space-y-3.5">
            {/* Title & Brand Store Link */}
            <div>
              <h1 className="text-lg sm:text-2xl font-medium text-stone-900 leading-snug">
                {product.name} ({product.netQuantity || 'Standard Pack'})
              </h1>
              <Link
                href="/products"
                className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline font-normal inline-block mt-1"
              >
                Visit the {product.brand?.name || 'Triven Pure Heritage'} Store
              </Link>
            </div>

            {/* Ratings & Social Proof */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div className="flex items-center text-amber-500 font-semibold gap-1">
                <span className="text-stone-800 font-medium">{product.rating || 4.8}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <ChevronDown className="w-3 h-3 text-stone-500" />
              </div>
              <span className="text-stone-300">|</span>
              <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                {(product.numReviews || 24).toLocaleString()} ratings
              </span>
            </div>

            {/* Triven's Choice Tag */}
            <div className="flex items-center gap-2">
              <div className="bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                <span>Triven's</span>
                <span className="text-white">Choice</span>
              </div>
              <span className="text-xs text-stone-600">in Classical Ayurvedic Formulations</span>
            </div>

            <div className="text-xs text-stone-700">
              <strong>20K+ bought</strong> in past month
            </div>

            <hr className="border-stone-200" />

            {/* Mega Festival Deal Badge & Amazon Price Block */}
            <div className="space-y-1">
              <div className="inline-block bg-[#CC0C39] text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px]">
                Mega Festival Deal
              </div>

              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-[#CC0C39] font-light text-3xl font-sans">-{discountPercent}%</span>
                <span className="text-3xl font-medium text-stone-900">₹{product.sellingPrice}</span>
                <span className="text-xs text-stone-500 font-normal">
                  ({formatPricePerUnit(product)})
                </span>
              </div>

              <div className="text-xs text-stone-500">
                M.R.P.: <span className="line-through">₹{product.mrp}</span>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-0.5 bg-[#232F3E] text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px]">
                  <span className="text-[#FFA41C] italic font-serif text-xs font-black">a</span> Fulfilled
                </span>
                <span className="text-xs text-stone-600">Inclusive of all taxes</span>
              </div>
            </div>

            {/* Amazon Offers Strip with 3 Cards */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <div className="w-4 h-4 rounded-full border border-stone-800 flex items-center justify-center text-[10px]">
                  %
                </div>
                <span>Offers</span>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 text-xs">
                {/* Cashback */}
                <div className="p-2.5 bg-white rounded-lg border border-stone-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-stone-800 block text-[11px]">Cashback</span>
                    <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">
                      Upto ₹25.00 cashback as Triven Pay Balance when you...
                    </p>
                  </div>
                  <span className="text-[11px] text-[#007185] font-medium mt-1.5 hover:underline cursor-pointer">
                    1 offer ›
                  </span>
                </div>

                {/* Bank Offer */}
                <div className="p-2.5 bg-white rounded-lg border border-stone-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-stone-800 block text-[11px]">Bank Offer</span>
                    <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">
                      Upto ₹1,500.00 discount on SBI/HDFC Credit Cards...
                    </p>
                  </div>
                  <span className="text-[11px] text-[#007185] font-medium mt-1.5 hover:underline cursor-pointer">
                    17 offers ›
                  </span>
                </div>

                {/* Partner Offers */}
                <div className="p-2.5 bg-white rounded-lg border border-stone-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-stone-800 block text-[11px]">Partner Offers</span>
                    <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">
                      Buy 3 Get 5% Off, Buy 4 Get 7% Off...
                    </p>
                  </div>
                  <span className="text-[11px] text-[#007185] font-medium mt-1.5 hover:underline cursor-pointer">
                    3 offers ›
                  </span>
                </div>
              </div>
            </div>

            {/* Amazon 6-Icon Service Grid (Matching exact reference screenshot) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 py-3 border-y border-stone-200 text-center">
              <div className="flex flex-col items-center justify-start gap-1 p-1">
                <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[#007185]">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-[#007185] leading-tight hover:underline cursor-pointer">
                  Clearance sale – no return
                </span>
              </div>

              <div className="flex flex-col items-center justify-start gap-1 p-1">
                <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[#007185]">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-[#007185] leading-tight hover:underline cursor-pointer">
                  Pay on Delivery
                </span>
              </div>

              <div className="flex flex-col items-center justify-start gap-1 p-1">
                <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[#007185]">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-[#007185] leading-tight hover:underline cursor-pointer">
                  Triven Delivered
                </span>
              </div>

              <div className="flex flex-col items-center justify-start gap-1 p-1">
                <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[#007185]">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-[#007185] leading-tight hover:underline cursor-pointer">
                  Top Brand
                </span>
              </div>

              <div className="flex flex-col items-center justify-start gap-1 p-1">
                <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[#007185]">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-[#007185] leading-tight hover:underline cursor-pointer">
                  Free Delivery
                </span>
              </div>

              <div className="flex flex-col items-center justify-start gap-1 p-1">
                <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[#007185]">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-[#007185] leading-tight hover:underline cursor-pointer">
                  Secure transaction
                </span>
              </div>
            </div>

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
                <li>Wild-crafted in pristine Himalayan foothills using chemical-free traditional methods.</li>
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
                  <span className="font-bold text-[#C5A059]">✓ Triven Prime</span>
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
                    <span className="text-sm font-bold text-stone-900">In Stock</span>
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
                      ? 'bg-[#0F1D36] text-[#C5A059] border border-[#C5A059]'
                      : 'bg-[#0F1D36] hover:bg-[#162238] text-[#C5A059] border border-[#C5A059]/40 hover:border-[#C5A059] active:scale-98 shadow-sm'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-[#C5A059]" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] hover:brightness-105 text-[#0F1D36] transition-all shadow-[0_4px_18px_rgba(212,175,55,0.35)] active:scale-98"
                >
                  Instant Royal Checkout
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
                <div className="pt-1 text-[#8C5E3C] font-semibold">
                  ✓ Cash on Delivery Available
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* FREQUENTLY BOUGHT TOGETHER BUNDLE */}
      {relatedProducts && relatedProducts.length >= 2 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
          <h3 className="font-serif font-bold text-stone-900 text-lg mb-4">
            Frequently Bought Together
          </h3>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <div className="w-24 h-24 rounded-lg bg-stone-50 border border-stone-200 p-1 shrink-0">
                <ProductImage src={activeImage} alt="" className="w-full h-full object-cover rounded" />
              </div>
              <span className="text-xl text-stone-400 font-light">+</span>
              <div className="w-24 h-24 rounded-lg bg-stone-50 border border-stone-200 p-1 shrink-0">
                <ProductImage
                  src={relatedProducts[0]?.images?.[0] || null}
                  alt={relatedProducts[0]?.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <span className="text-xl text-stone-400 font-light">+</span>
              <div className="w-24 h-24 rounded-lg bg-stone-50 border border-stone-200 p-1 shrink-0">
                <ProductImage
                  src={relatedProducts[1]?.images?.[0] || null}
                  alt={relatedProducts[1]?.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </div>

            <div className="space-y-2 lg:text-right">
              <div className="flex items-baseline gap-2 lg:justify-end">
                <span className="text-xs text-stone-600">Total price for all 3:</span>
                <span className="text-2xl font-bold text-stone-900">
                  ₹{product.sellingPrice + relatedProducts[0].sellingPrice + relatedProducts[1].sellingPrice}
                </span>
              </div>
              <button
                onClick={handleAddBundle}
                className="bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] border border-[#D4AF37]/40 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md"
              >
                Add all 3 to Cart
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded text-[#0F1D36]" />
              <span><strong>This item:</strong> {product.name} (₹{product.sellingPrice})</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded text-[#0F1D36]" />
              <span>{relatedProducts[0].name} (₹{relatedProducts[0].sellingPrice})</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded text-[#0F1D36]" />
              <span>{relatedProducts[1].name} (₹{relatedProducts[1].sellingPrice})</span>
            </label>
          </div>
        </div>
      )}

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
              <th className="p-3 bg-amber-50/50 font-serif font-bold text-stone-900 w-1/4 border-x border-stone-200">
                <span className="block text-[10px] text-[#8C5E3C] uppercase font-sans">This Item</span>
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
                <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" /> {product.rating || 4.9} ({product.numReviews || 24})</span>
              </td>
              <td className="p-3 border-r border-stone-200 text-amber-600">
                <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" /> 4.9 (31)</span>
              </td>
              <td className="p-3 text-amber-600">
                <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" /> 5.0 (38)</span>
              </td>
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
              <td className="p-3 border-x border-stone-200 text-stone-900 font-bold">✓ 100% Genuine</td>
              <td className="p-3 border-r border-stone-200 text-stone-900 font-bold">✓ 100% Genuine</td>
              <td className="p-3 text-stone-900 font-bold">✓ 100% Genuine</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stone-600 bg-stone-50/40">Sold By</td>
              <td className="p-3 border-x border-stone-200 font-medium">{product.brand?.name || 'Triven Pure Heritage'}</td>
              <td className="p-3 border-r border-stone-200">Kottakkal Arya Vaidya</td>
              <td className="p-3">Triven Pure Heritage</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-stone-600 bg-stone-50/40">Prime Fast Delivery</td>
              <td className="p-3 border-x border-stone-200 text-[#C5A059] font-bold">✓ Tomorrow</td>
              <td className="p-3 border-r border-stone-200 text-[#C5A059] font-bold">✓ Tomorrow</td>
              <td className="p-3 text-[#C5A059] font-bold">✓ Tomorrow</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* AMAZON CUSTOMER QUESTIONS & ANSWERS (Q&A) */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg sm:text-xl flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#C5A059]" />
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
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
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
                  <span className="font-bold text-[#8C5E3C] shrink-0">Answer:</span>
                  <div className="space-y-1.5 text-stone-700 leading-relaxed">
                    <p>{qa.a}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 pt-1">
                      <span className="font-medium text-stone-700">{qa.by}</span>
                      <span>•</span>
                      <span>{qa.date}</span>
                      <span>•</span>
                      <button
                        onClick={() => handleVoteHelpful(qa.id)}
                        className="inline-flex items-center gap-1 text-stone-600 hover:text-[#8C5E3C] font-semibold transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3 text-[#8C5E3C]" />
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
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Needs Improvement</option>
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
                  <p className="text-xs text-stone-900 font-medium bg-amber-50/80 border border-amber-200 p-2 rounded-lg">
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
                        ? 'bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/30 shadow-xs'
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
                      <div className="w-6 h-6 rounded-full bg-[#0F1D36] text-[#D4AF37] flex items-center justify-center text-[10px] font-bold">
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

                    {/* Review Helpful Bar */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-500 border-t border-stone-200/60">
                      <span>14 people found this helpful</span>
                      <span>•</span>
                      <button
                        onClick={() => handleVoteHelpful(`rev_${i}`)}
                        className="inline-flex items-center gap-1 text-stone-700 hover:text-[#8C5E3C] font-semibold border border-stone-300 rounded px-2 py-0.5 hover:bg-white transition-colors"
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
          <span className="text-[11px] font-bold text-[#C5A059] block truncate">
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
            className={`min-h-[44px] px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : added
                ? 'bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40'
                : 'bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] border border-[#D4AF37]/40 active:scale-95'
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

      {/* FULLSCREEN AMAZON LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white max-w-6xl mx-auto w-full z-20">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-xl text-stone-100">{product.name}</h3>
              <p className="text-xs text-[#D4AF37] font-medium">
                Angle {activeImageIndex + 1} of {productImages.length} • Triven Ayurveda High-Resolution Studio View
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close high-res view"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Stage */}
          <div
            className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full py-4 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {productImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-xl transition-all z-20 border border-white/20 cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Previous angle"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            <div className="max-h-[72vh] max-w-[85vw] flex items-center justify-center">
              <img
                src={activeImage}
                alt={`${product.name} - Angle ${activeImageIndex + 1}`}
                className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {productImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-xl transition-all z-20 border border-white/20 cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Next angle"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {productImages.length > 1 && (
            <div
              className="max-w-3xl mx-auto w-full flex items-center justify-center gap-3 overflow-x-auto py-2 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all bg-stone-900 shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-105 shadow-lg'
                      : 'border-white/20 hover:border-white/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
