'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  Home,
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  MapPin,
  Sparkles,
  Heart,
  HelpCircle,
  Truck,
  Check,
  Flame,
  ArrowRight,
  Navigation,
  Globe,
  Leaf,
  Droplet,
  HeartPulse,
  Crown,
  Stethoscope,
  Award,
} from 'lucide-react';
import AddressMapPicker from '@/components/store/AddressMapPicker';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isStaff, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Dynamic Categories from Database
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // 0ms instant load from sessionStorage cache if available
    try {
      const cached = sessionStorage.getItem('ayur_cached_cats');
      if (cached) {
        setCategories(JSON.parse(cached));
      }
    } catch (e) {}

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (res.ok && json.data) {
          const active = json.data.filter((c) => c.isActive !== false);
          setCategories(active);
          try {
            sessionStorage.setItem('ayur_cached_cats', JSON.stringify(active));
          } catch (e) {}
        }
      } catch (e) {
        console.error('Failed to load categories in navbar', e);
      }
    };
    fetchCategories();
  }, []);

  // Dropdown & Modals state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [allDrawerOpen, setAllDrawerOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const handleMapLocationPicked = (loc) => {
    if (loc.pincode) setCurrentPincode(loc.pincode);
    if (loc.city) setCurrentCity(loc.city);
    try {
      if (loc.pincode) localStorage.setItem('triven_pincode', loc.pincode);
      if (loc.city) localStorage.setItem('triven_city', loc.city);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
    setIsMapPickerOpen(false);
    setLocationModalOpen(false);
  };

  // Location / Pincode state
  const [currentPincode, setCurrentPincode] = useState('110001');
  const [currentCity, setCurrentCity] = useState('New Delhi');
  const [tempPincode, setTempPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState(null);

  // Load saved pincode from storage or user default address
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem('triven_pincode');
      const savedCity = localStorage.getItem('triven_city');

      if (user?.addresses && user.addresses.length > 0) {
        const matchingAddr = savedPin ? user.addresses.find((a) => a.pincode === savedPin) : null;
        const targetAddr = matchingAddr || user.addresses.find((a) => a.isDefault) || user.addresses[0];

        if (targetAddr) {
          // If user specifically entered a custom valid PIN in modal, keep it
          if (savedPin && !matchingAddr && savedCity && savedCity !== 'India') {
            setCurrentPincode(savedPin);
            setCurrentCity(savedCity);
            return;
          }
          if (targetAddr.pincode) setCurrentPincode(targetAddr.pincode);
          if (targetAddr.city) setCurrentCity(targetAddr.city);
          localStorage.setItem('triven_pincode', targetAddr.pincode);
          localStorage.setItem('triven_city', targetAddr.city);
          return;
        }
      }

      if (savedPin) setCurrentPincode(savedPin);
      if (savedCity) setCurrentCity(savedCity);
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const p = localStorage.getItem('triven_pincode');
        const c = localStorage.getItem('triven_city');
        if (p) setCurrentPincode(p);
        if (c) setCurrentCity(c);
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSelectSavedAddress = (addr) => {
    if (addr.pincode) setCurrentPincode(addr.pincode);
    if (addr.city) setCurrentCity(addr.city);
    try {
      if (addr.pincode) localStorage.setItem('triven_pincode', addr.pincode);
      if (addr.city) localStorage.setItem('triven_city', addr.city);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
    setLocationModalOpen(false);
  };

  // Live search suggestions with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const json = await res.json();
        if (json.data && json.data.products) {
          setSuggestions(json.data.products);
          setShowSuggestions(true);
        }
      } catch (e) {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent scroll when drawer or mobile menu or modal is open
  useEffect(() => {
    if (allDrawerOpen || mobileMenuOpen || locationModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [allDrawerOpen, mobileMenuOpen, locationModalOpen]);

  // Keyboard accessibility: Close modals on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAllDrawerOpen(false);
        setMobileMenuOpen(false);
        setLocationModalOpen(false);
        setUserDropdownOpen(false);
        setShowSuggestions(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const query = searchQuery.trim();
    let url = '/products?';
    if (query) url += `search=${encodeURIComponent(query)}&`;
    if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;
    router.push(url.endsWith('&') || url.endsWith('?') ? url.slice(0, -1) : url);
  };

  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    if (!tempPincode || tempPincode.length !== 6) {
      setPincodeMessage('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    setPincodeLoading(true);
    setPincodeMessage(null);
    try {
      const res = await fetch(`/api/pincodes/check?pincode=${tempPincode}`);
      const json = await res.json();
      if (res.ok && json.data.serviceable) {
        const resolvedCity = json.data.city || 'India';
        setCurrentPincode(tempPincode);
        setCurrentCity(resolvedCity);
        localStorage.setItem('triven_pincode', tempPincode);
        localStorage.setItem('triven_city', resolvedCity);
        setPincodeMessage(`Delivery location updated to ${resolvedCity} (${tempPincode})!`);
        setTimeout(() => setLocationModalOpen(false), 800);
      } else {
        setPincodeMessage(json.error || 'PIN code is not serviceable at this moment.');
      }
    } catch (err) {
      setPincodeMessage('Standard pan-India delivery available.');
      setCurrentPincode(tempPincode);
      localStorage.setItem('triven_pincode', tempPincode);
      setTimeout(() => setLocationModalOpen(false), 1200);
    } finally {
      setPincodeLoading(false);
    }
  };

  return (
    <>
      {/* Top High-Conversion Announcement Strip */}
      <div className="bg-[#0F1D36] text-[#FAF8F5] text-[11px] sm:text-xs py-1.5 px-3 border-b border-[#D4AF37]/30 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="inline-flex items-center gap-1 bg-[#D4AF37]/25 text-[#D4AF37] px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider shrink-0 uppercase">
              <Sparkles className="w-3 h-3" />
              <span>COD AVAILABLE</span>
            </span>
            <span className="truncate font-medium text-stone-200">
              🌿 <strong>Cash on Delivery (COD) उपलब्ध है</strong> • पूरे भारत में 4-5 दिन में मुफ़्त होम डिलीवरी (Free Pan-India Delivery)
            </span>
          </div>
          <Link
            href="/order-now"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0F1D36] font-bold text-[11px] px-3 py-0.5 rounded-full transition-all shrink-0 shadow-xs"
          >
            <span>झटपट COD आर्डर</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Slim Luxury Navigation Bar (Sticky across all devices) */}
      <header className="sticky top-0 z-30 shadow-xs bg-white/95 backdrop-blur-md text-stone-900 border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 gap-1.5 sm:gap-4">

            {/* Logo */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Link href="/" className="flex items-center gap-1.5 sm:gap-3 shrink-0 group py-1 px-0.5 sm:px-2 rounded-lg hover:bg-stone-50 transition-all">
                <img
                  src="/logo-icon.png"
                  alt="Triven Ayurveda"
                  className="w-7 h-7 xxs:w-8 xxs:h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 object-contain drop-shadow-xs group-hover:scale-105 transition-transform shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-serif text-[13px] xxs:text-[15px] sm:text-xl md:text-2xl font-bold tracking-tight text-[#1a4d2e] leading-none group-hover:text-[#143e24] transition-colors whitespace-nowrap">
                    TRIVEN AYURVEDA
                  </span>
                  <span className="hidden xxs:block text-[7px] sm:text-[9px] tracking-widest uppercase font-semibold text-[#b8860b] mt-0.5 sm:mt-1 whitespace-nowrap">
                    The Gift of Wellness
                  </span>
                </div>
              </Link>
            </div>

            {/* Delivery Location Selector (Interactive Modal Trigger) */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="hidden lg:flex items-center gap-2 py-1.5 px-3 rounded-lg border border-stone-200/70 bg-stone-50/60 hover:bg-stone-100/80 text-left transition-all text-xs cursor-pointer focus:outline-none"
              aria-label="Choose delivery location"
            >
              <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-stone-500">Deliver to {user?.name ? (user.name.startsWith('Dr.') ? user.name.split(' ').slice(0, 2).join(' ') : user.name.split(' ')[0]) : 'India'}</span>
                <span className="font-bold text-stone-900">{currentCity} {currentPincode}</span>
              </div>
            </button>

            {/* Amazon-style Search Bar with Live Suggestions Dropdown (Desktop & Tablet) */}
            <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-2xl relative">
              <form onSubmit={handleSearch} className="flex shadow-xs">
                {/* Category Dropdown */}
                <div className="hidden lg:flex relative shrink-0">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium px-3 pr-7 py-2.5 rounded-l-md border border-r-0 border-stone-300 focus:outline-none appearance-none cursor-pointer h-full"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2 top-3.5 pointer-events-none" />
                </div>

                {/* Input field */}
                <input
                  type="text"
                  placeholder="Search Ashwagandha, Bhringraj, Gut Health, Shilajit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full bg-white text-stone-900 px-4 py-2 text-sm border border-stone-300 focus:outline-none rounded-l-md lg:rounded-l-none"
                />

                {/* Royal Sapphire / Gold Search Button */}
                <button
                  type="submit"
                  className="bg-[#0F1D36] hover:bg-[#162238] text-[#C5A059] px-4 sm:px-5 py-2 rounded-r-md transition-colors flex items-center justify-center font-bold min-w-[44px] border-l border-stone-200"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-[#C5A059] stroke-[2.5]" />
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-50 text-stone-900 animate-in fade-in">
                  <div className="p-2 border-b border-stone-100 bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Classical Formulations Matching "{searchQuery}"
                  </div>
                  <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                    {suggestions.map((p) => (
                      <Link
                        key={p._id}
                        href={`/products/${p.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-3 hover:bg-amber-50/60 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                          {p.images && p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Sparkles className="w-4 h-4 text-[#C5A059]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-stone-900 group-hover:text-[#8C5E3C] truncate">
                            {p.name}
                          </p>
                          <span className="text-[11px] text-stone-500">
                            {p.dosageForm} • {p.netQuantity}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-stone-900">₹{p.sellingPrice}</span>
                          {p.mrp > p.sellingPrice && (
                            <span className="block text-[10px] text-stone-400 line-through">₹{p.mrp}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => setShowSuggestions(false)}
                    className="block p-2.5 text-center bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-900 transition-colors border-t border-stone-100"
                  >
                    See all results for "{searchQuery}" →
                  </Link>
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-0.5 sm:gap-2.5 shrink-0">
              
              {/* Language / Region */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg border border-stone-200/80 hover:border-[#C5A059] bg-stone-50/50 cursor-pointer text-[#14171F]">
                <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>EN</span>
              </div>

              {/* Wishlist Heart Icon - Accessible on all screen sizes */}
              <Link
                href="/wishlist"
                className="flex items-center justify-center min-w-[36px] sm:min-w-[40px] min-h-[40px] sm:min-h-[44px] py-1 px-1.5 sm:px-2 rounded-lg hover:bg-stone-100 transition-all text-xs"
                title="Your Wishlist"
                aria-label="Wishlist"
              >
                <div className="relative">
                  <Heart className="w-5 h-5 text-stone-700 hover:text-red-500 transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* 'Returns & Orders' */}
              <Link
                href="/orders"
                className="hidden md:flex flex-col text-left py-1 px-2 rounded-lg hover:bg-stone-100 transition-colors text-xs min-h-[44px] justify-center"
              >
                <span className="text-[10px] text-stone-500">Returns</span>
                <span className="font-bold text-stone-900">& Orders</span>
              </Link>

              {/* Shopping Cart */}
              <Link
                href="/checkout"
                className="flex items-center gap-1 min-w-[38px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] py-1 px-1.5 sm:px-2.5 rounded-lg hover:bg-stone-100 transition-all group"
                aria-label="View Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-stone-800 group-hover:text-[#C5A059] transition-colors" />
                  <span className="absolute -top-1.5 -right-2 bg-[#0F1D36] text-[#C5A059] text-[10px] sm:text-xs font-black w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md border border-[#C5A059]/40">
                    {cartCount}
                  </span>
                </div>
                <span className="hidden sm:inline font-bold text-xs text-stone-900 group-hover:text-[#C5A059] mt-2">
                  Cart
                </span>
              </Link>

              {/* User Account Menu (Visible across all devices including smartphones) */}
              <div className="flex relative">
                {user ? (
                  <div>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center justify-center py-1 px-1 sm:px-2 rounded-lg hover:bg-stone-100 transition-all text-xs focus:outline-none min-h-[40px] sm:min-h-[44px]"
                      aria-label="User account"
                    >
                      {/* Desktop text display */}
                      <div className="hidden sm:flex flex-col text-left">
                        <span className="text-[10px] text-stone-500">Hello, {user.name.split(' ')[0]}</span>
                        <div className="flex items-center gap-1 font-bold text-stone-900">
                          <span>Account & Lists</span>
                          <ChevronDown className="w-3 h-3 text-stone-400" />
                        </div>
                      </div>

                      {/* Mobile compact luxury avatar with user first name */}
                      <div className="sm:hidden flex items-center gap-1 py-0.5 px-1 rounded-lg border border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 transition-colors">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F1D36] text-[#D4AF37] font-serif font-bold text-[11px] ring-1 ring-[#D4AF37]/50 shadow-xs shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-[11px] font-bold text-stone-900 truncate max-w-[50px] leading-tight">
                          {user.name ? user.name.split(' ')[0] : 'User'}
                        </span>
                        <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
                      </div>
                    </button>

                    {userDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-56 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-stone-200 py-2 z-50 text-sm animate-in fade-in"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-stone-100">
                          <p className="font-semibold text-stone-900 truncate">{user.name}</p>
                          <p className="text-xs text-stone-500 truncate">{user.email || user.phone}</p>
                        </div>

                        {isStaff && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-stone-900 font-semibold hover:bg-stone-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#C5A059]" />
                            <span>Admin Master Panel</span>
                          </Link>
                        )}

                        <Link
                          href="/account"
                          className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-stone-400" />
                          <span>Your Account Hub</span>
                        </Link>

                        <Link
                          href="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-[#C5A059]" />
                          <span>Your Orders</span>
                        </Link>

                        <Link
                          href="/wishlist"
                          className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>Your Wish List</span>
                        </Link>

                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center py-1 px-1 sm:px-2.5 rounded-lg hover:bg-stone-100 transition-colors text-xs min-h-[40px] sm:min-h-[44px]"
                    aria-label="Sign in"
                  >
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-[10px] text-stone-500">Hello, Sign in</span>
                      <span className="font-bold text-stone-900">Account & Lists</span>
                    </div>
                    <div className="sm:hidden flex items-center gap-1 py-1 px-1.5 rounded-lg border border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 text-stone-800">
                      <User className="w-3.5 h-3.5 text-stone-700" />
                      <span className="text-[11px] font-bold text-stone-900">Sign in</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dedicated Mobile Search & Location Bar (Relative in document flow, scrolls naturally, hidden in checkout) */}
      {!pathname.startsWith('/checkout') && (
        <div className="md:hidden relative z-20 px-3 sm:px-4 pb-2 pt-1.5 bg-[#0F1D36] border-t border-stone-800/40 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1 text-[11px] text-stone-200">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors text-left py-0.5 truncate max-w-full"
              aria-label="Choose delivery location"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">Deliver to <strong>{user?.name ? (user.name.startsWith('Dr.') ? user.name.split(' ').slice(0, 2).join(' ') : user.name.split(' ')[0]) + ' - ' : ''}{currentCity} {currentPincode}</strong></span>
              <span className="text-[#D4AF37] font-bold shrink-0">›</span>
            </button>
          </div>

        <form onSubmit={handleSearch} className="flex shadow-xs relative">
          <input
            type="text"
            placeholder="Search classical medicines, herbs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="w-full bg-[#FAF8F5] border border-stone-300 text-[#14171F] px-3 py-1.5 text-xs rounded-l-lg focus:outline-none min-h-[38px] placeholder:text-stone-400"
          />
          <button
            type="submit"
            className="bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] border-y border-r border-[#D4AF37]/40 px-3.5 py-1.5 rounded-r-lg transition-colors flex items-center justify-center font-bold min-w-[42px] min-h-[38px]"
            aria-label="Search formulations"
          >
            <Search className="w-4 h-4 text-[#D4AF37] stroke-[2.5]" />
          </button>
        </form>

        {/* Mobile Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-1 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden text-stone-900 divide-y divide-stone-100 max-h-64 overflow-y-auto">
            {suggestions.map((p) => (
              <Link
                key={p._id}
                href={`/products/${p.slug}`}
                onClick={() => setShowSuggestions(false)}
                className="flex items-center gap-3 p-2.5 hover:bg-amber-50/60 transition-colors"
              >
                <div className="w-9 h-9 rounded-md bg-stone-100 overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                  {p.images && p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{p.name}</p>
                  <span className="text-[10px] text-stone-500">{p.netQuantity} • ₹{p.sellingPrice}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      )}

    {/* Sub-Navigation Bar (Utility Bar with All Drawer Trigger) */}
    <div className="bg-[#FAF8F5] text-stone-700 border-b border-stone-200/80 text-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-9 overflow-x-auto touch-scroll scrollbar-none gap-2">
          
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* The Iconic 'All' Drawer Trigger */}
            <button
              type="button"
              onClick={() => setAllDrawerOpen(true)}
              className="flex items-center gap-1.5 font-bold text-[#D4AF37] py-1 px-2.5 rounded-lg transition-all cursor-pointer bg-[#0F1D36] hover:bg-[#162238] border border-[#D4AF37]/30 shadow-xs shrink-0 whitespace-nowrap"
            >
              <Menu className="w-4 h-4 text-[#D4AF37]" />
              <span>All Medicines</span>
            </button>

            <Link href="/products?bestseller=true" className="py-1 px-2 rounded hover:bg-stone-200/60 transition-all font-medium text-stone-700 hover:text-stone-950 shrink-0 whitespace-nowrap">
              Bestsellers
            </Link>

            <Link href="/products" className="py-1 px-2 rounded hover:bg-stone-200/60 transition-all font-medium text-stone-700 hover:text-stone-950 shrink-0 whitespace-nowrap">
              Today's Deals
            </Link>

            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat._id}
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="py-1 px-2 rounded hover:bg-stone-200/60 transition-all font-medium text-stone-700 hover:text-stone-950 hidden sm:inline-block shrink-0 whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}

            <Link href="/order-now" className="py-1 px-2.5 rounded-full bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/50 hover:bg-[#162238] transition-all font-bold text-xs shrink-0 whitespace-nowrap flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>COD आर्डर / मुफ़्त परामर्श</span>
            </Link>
          </div>

          {/* Right Prime Badge */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#C5A059] font-bold shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vedic Prime: 1-Day Delivery</span>
          </div>

        </div>
      </div>
    </div>

      {/* ============================================================ */}
      {/* THE ICONIC AMAZON SLIDE-OVER CATEGORY DRAWER                 */}
      {/* ============================================================ */}
      {allDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setAllDrawerOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="relative w-[84vw] max-w-sm sm:w-96 bg-white text-stone-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            {/* Drawer User Header */}
            <div className="bg-[#0F1D36] text-white p-4 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#0F1D36] flex items-center justify-center font-bold text-sm shadow-sm">
                  {user ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5 text-[#0F1D36]" />}
                </div>
                <span className="font-serif font-bold text-base text-white">
                  Hello, {user ? user.name.split(' ')[0] : 'Sign In'}
                </span>
              </div>
              <button
                onClick={() => setAllDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Categories Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-200 text-xs">
              
              {/* Trending */}
              <div className="p-4 space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-sm tracking-wide uppercase">
                  Trending
                </h3>
                <div className="space-y-1 font-medium text-stone-700">
                  <Link href="/products?bestseller=true" onClick={() => setAllDrawerOpen(false)} className="flex items-center justify-between py-2 px-2 hover:bg-stone-100 rounded">
                    <span>Best Sellers</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                  <Link href="/products" onClick={() => setAllDrawerOpen(false)} className="flex items-center justify-between py-2 px-2 hover:bg-stone-100 rounded">
                    <span>Today's Deals</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                  <Link href="/products?featured=true" onClick={() => setAllDrawerOpen(false)} className="flex items-center justify-between py-2 px-2 hover:bg-stone-100 rounded">
                    <span>Featured Classical Remedies</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                </div>
              </div>

              {/* Shop By Ayurvedic Department */}
              <div className="p-4 space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-sm tracking-wide uppercase">
                  Shop By Category
                </h3>
                <div className="space-y-1 font-medium text-stone-700">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat._id}
                        href={`/products?category=${encodeURIComponent(cat.slug)}`}
                        onClick={() => setAllDrawerOpen(false)}
                        className="flex items-center justify-between py-2 px-2 hover:bg-stone-100 rounded"
                      >
                        <span className="flex items-center gap-2.5">
                          <Leaf className="w-4 h-4 text-[#C5A059]" />
                          <span>{cat.name}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </Link>
                    ))
                  ) : (
                    <Link
                      href="/products"
                      onClick={() => setAllDrawerOpen(false)}
                      className="flex items-center justify-between py-2 px-2 hover:bg-stone-100 rounded"
                    >
                      <span className="flex items-center gap-2.5">
                        <Leaf className="w-4 h-4 text-[#C5A059]" />
                        <span>All Formulations</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Programs & Features */}
              <div className="p-4 space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-sm tracking-wide uppercase">
                  Programs & Features
                </h3>
                <div className="space-y-1 font-medium text-stone-700">
                  <Link href="/products" onClick={() => setAllDrawerOpen(false)} className="flex items-center justify-between py-2 px-2 hover:bg-stone-100 rounded">
                    <span className="flex items-center gap-2.5">
                      <Crown className="w-4 h-4 text-[#C5A059]" />
                      <span>Triven Vedic Prime Club</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                  <Link href="/products" onClick={() => setAllDrawerOpen(false)} className="flex items-center justify-between py-2 px-2 hover:bg-stone-100 rounded">
                    <span className="flex items-center gap-2.5">
                      <Stethoscope className="w-4 h-4 text-[#C5A059]" />
                      <span>Free Vaidya Consultation & Dosha Quiz</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                  <Link href="/products" onClick={() => setAllDrawerOpen(false)} className="flex items-center justify-between py-2 px-2 hover:bg-stone-100 rounded">
                    <span className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-[#C5A059]" />
                      <span>AYUSH Samhita Standards</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                </div>
              </div>

              {/* Help & Settings */}
              <div className="p-4 space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-sm tracking-wide uppercase">
                  Help & Settings
                </h3>
                <div className="space-y-1 font-medium text-stone-700">
                  <Link href="/account" onClick={() => setAllDrawerOpen(false)} className="block py-2 px-2 hover:bg-stone-100 rounded">
                    Your Account
                  </Link>
                  <Link href="/orders" onClick={() => setAllDrawerOpen(false)} className="block py-2 px-2 hover:bg-stone-100 rounded">
                    Track Orders
                  </Link>
                  {user ? (
                    <button
                      onClick={() => {
                        setAllDrawerOpen(false);
                        logout();
                      }}
                      className="w-full text-left py-2 px-2 hover:bg-red-50 text-red-600 rounded"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link href="/login" onClick={() => setAllDrawerOpen(false)} className="block py-2 px-2 font-bold text-stone-900 hover:bg-stone-100 rounded">
                      Sign In
                    </Link>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* AMAZON DELIVERY LOCATION / PINCODE MODAL                     */}
      {/* ============================================================ */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setLocationModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 z-10 animate-in zoom-in-95 duration-200 text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <span>Choose your location</span>
              </h3>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              Select a delivery location to see product availability, exact dispatch schedules, and free delivery benefits.
            </p>

            {/* If user is logged in and has saved addresses, display them for 1-click select */}
            {user?.addresses && user.addresses.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                  Your saved addresses
                </span>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {user.addresses.map((addr) => {
                    const isSelected = currentPincode === addr.pincode;
                    return (
                      <button
                        key={addr._id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'border-[#C5A059] bg-amber-50/70 ring-1 ring-[#C5A059]'
                            : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#8C5E3C]' : 'text-stone-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 truncate">
                              {addr.fullName || user.name}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 truncate mt-0.5">
                            {addr.addressLine1}, {addr.city} {addr.pincode}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="text-right">
                  <Link
                    href="/account"
                    onClick={() => setLocationModalOpen(false)}
                    className="text-[11px] text-[#8C5E3C] hover:underline font-semibold"
                  >
                    Manage address book ›
                  </Link>
                </div>

                <div className="relative my-3 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
                  <span className="relative bg-white px-2 text-[10px] text-stone-400 uppercase font-semibold">Or enter an Indian PIN code</span>
                </div>
              </div>
            )}

            <form onSubmit={handlePincodeSubmit} className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Indian PIN code"
                  value={tempPincode}
                  onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                />
                <button
                  type="submit"
                  disabled={pincodeLoading}
                  className="bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] border border-[#D4AF37]/40 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-xs"
                >
                  {pincodeLoading ? 'Checking...' : 'Apply'}
                </button>
              </div>

              {pincodeMessage && (
                <p className="text-xs text-stone-800 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  {pincodeMessage}
                </p>
              )}
            </form>

            <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setLocationModalOpen(false);
                  setIsMapPickerOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#8C5E3C] font-bold text-xs transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Choose Location on Map (PIN code or Area)</span>
              </button>

              <div className="text-xs text-stone-500 flex items-center justify-between">
                <span>Current: <strong>{currentPincode} ({currentCity})</strong></span>
                <span className="text-amber-800 font-semibold inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>Free Prime Delivery</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet Interactive Map Picker Modal */}
      <AddressMapPicker
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialPincode={currentPincode}
        initialCity={currentCity}
        onLocationSelect={handleMapLocationPicked}
      />

      {/* Mobile Bottom Navigation Bar (Hidden on Product Details & Checkout for distraction-free / dedicated action bar) */}
      {!(pathname.startsWith('/checkout') || (pathname.startsWith('/products/') && pathname !== '/products')) && (
        <nav
          aria-label="Mobile Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EBE6DD] shadow-[0_-4px_25px_rgba(15,29,54,0.06)] md:hidden pt-2 pb-[max(env(safe-area-inset-bottom,0px),12px)] transform-gpu will-change-transform"
        >
          <div className="grid grid-cols-5 items-center justify-around text-center px-1">
          {/* 1. Home */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`flex flex-col items-center justify-center py-1 select-none active:scale-95 transition-all min-h-[48px] ${
              pathname === '/' ? 'text-[#0F1D36]' : 'text-[#6E6761] hover:text-[#0F1D36]'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Home className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5]' : 'stroke-[1.85]'}`} />
              {pathname === '/' && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#D4AF37] rounded-full" />
              )}
            </div>
            <span className={`text-[11px] leading-tight mt-1.5 tracking-tight ${pathname === '/' ? 'font-bold text-[#0F1D36]' : 'font-medium text-[#6E6761]'}`}>
              Home
            </span>
          </Link>

          {/* 2. You (Account) */}
          <Link
            href={user ? "/account" : "/login"}
            className={`flex flex-col items-center justify-center py-1 select-none active:scale-95 transition-all min-h-[48px] ${
              pathname.startsWith('/account') || pathname.startsWith('/login') ? 'text-[#0F1D36]' : 'text-[#6E6761] hover:text-[#0F1D36]'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <User className={`w-5 h-5 ${pathname.startsWith('/account') || pathname.startsWith('/login') ? 'stroke-[2.5]' : 'stroke-[1.85]'}`} />
              {user && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D4AF37] rounded-full ring-2 ring-white" />
              )}
            </div>
            <span className={`text-[11px] leading-tight mt-1.5 tracking-tight truncate max-w-[58px] ${pathname.startsWith('/account') || pathname.startsWith('/login') ? 'font-bold text-[#0F1D36]' : 'font-medium text-[#6E6761]'}`}>
              {user ? (user.name ? user.name.split(' ')[0] : 'You') : 'You'}
            </span>
          </Link>

          {/* 3. Wishlist */}
          <Link
            href="/wishlist"
            className={`flex flex-col items-center justify-center py-1 select-none active:scale-95 transition-all min-h-[48px] ${
              pathname.startsWith('/wishlist') ? 'text-[#0F1D36]' : 'text-[#6E6761] hover:text-[#0F1D36]'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Heart className={`w-5 h-5 ${pathname.startsWith('/wishlist') ? 'stroke-[2.5] text-red-500 fill-red-50' : 'stroke-[1.85]'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </div>
            <span className={`text-[11px] leading-tight mt-1.5 tracking-tight ${pathname.startsWith('/wishlist') ? 'font-bold text-[#0F1D36]' : 'font-medium text-[#6E6761]'}`}>
              Wishlist
            </span>
          </Link>

          {/* 4. Cart */}
          <Link
            href="/checkout"
            className={`flex flex-col items-center justify-center py-1 select-none active:scale-95 transition-all min-h-[48px] ${
              pathname.startsWith('/checkout') ? 'text-[#0F1D36]' : 'text-[#6E6761] hover:text-[#0F1D36]'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag className={`w-5 h-5 ${pathname.startsWith('/checkout') ? 'stroke-[2.5]' : 'stroke-[1.85]'}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span className={`text-[11px] leading-tight mt-1.5 tracking-tight ${pathname.startsWith('/checkout') ? 'font-bold text-[#0F1D36]' : 'font-medium text-[#6E6761]'}`}>
              Cart
            </span>
          </Link>

          {/* 5. All Drawer Trigger */}
          <button
            type="button"
            onClick={() => setAllDrawerOpen(true)}
            aria-label="Open All Categories Menu"
            className={`flex flex-col items-center justify-center py-1 select-none active:scale-95 transition-all cursor-pointer min-h-[48px] ${
              allDrawerOpen ? 'text-[#0F1D36]' : 'text-[#6E6761] hover:text-[#0F1D36]'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Menu className={`w-5 h-5 ${allDrawerOpen ? 'stroke-[2.5]' : 'stroke-[1.85]'}`} />
            </div>
            <span className={`text-[11px] leading-tight mt-1.5 tracking-tight ${allDrawerOpen ? 'font-bold text-[#0F1D36]' : 'font-medium text-[#6E6761]'}`}>
              All
            </span>
          </button>
        </div>
      </nav>
      )}
    </>
  );
}
