'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  Package,
  Search,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Star,
  Sparkles,
  MapPin,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import ProductImage from '@/components/store/ProductImage';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'buy-again' | 'not-shipped' | 'cancelled'
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('3-months');

  // Quick Track state for guest / unauthenticated users
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState(null);
  const [trackedOrder, setTrackedOrder] = useState(null);

  // In-line Login state for unauthenticated users
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    document.title = 'Your Orders & Tracking | Triven Ayurveda';
  }, []);

  const handleQuickTrack = async (e) => {
    e.preventDefault();
    if (!trackOrderNumber.trim() || !trackPhone.trim()) {
      setTrackError('Please enter both Order Number and 10-digit Mobile Number.');
      return;
    }
    setTrackLoading(true);
    setTrackError(null);
    setTrackedOrder(null);
    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(trackOrderNumber.trim())}&phone=${encodeURIComponent(
          trackPhone.trim()
        )}`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'No matching order found');
      }
      setTrackedOrder(json.data);
    } catch (err) {
      setTrackError(err.message);
    } finally {
      setTrackLoading(false);
    }
  };

  const handleInlineOrdersLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(loginIdentifier.trim(), loginPassword);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoadingOrders(false);
      return;
    }

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch('/api/orders');
        const json = await res.json();
        if (res.ok) {
          setOrders(json.data.orders || []);
        }
      } catch (e) {
        console.error('Failed to load user orders', e);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
      </div>
    );
  }

  if (!user) {
    const statusMap = {
      pending: 'Order Placed (Pending)',
      confirmed: 'Order Confirmed',
      processing: 'Compounding & Packed',
      shipped: 'In Transit / Dispatched',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2523]">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-8">
          {/* Triven Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Link href="/" className="hover:text-[#C5A059] hover:underline">
              Home
            </Link>
            <span>›</span>
            <span className="text-stone-800 font-semibold">Track Orders</span>
          </div>

          {/* Header */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C5A059]">
              Live Shipment & Order Tracker
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Track Your Triven Order
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Apne order ki live tracking dekhne ke liye apna <strong>10-digit Mobile Number</strong> aur <strong>Order Number</strong> dalein, ya apne account mein login karein.
            </p>
          </div>

          {/* Quick Track & Login Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* 1. Quick Track by Order ID */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#EBE6DD] shadow-luxury space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EBE6DD]">
                <Truck className="w-5 h-5 text-[#C5A059]" />
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900">
                    Quick Track by Order ID
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Instant tracking without signing in
                  </p>
                </div>
              </div>

              {trackError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}

              <form onSubmit={handleQuickTrack} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">
                    Order Number (ऑर्डर नंबर) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AYUR-2026-XXXXXX"
                    value={trackOrderNumber}
                    onChange={(e) => setTrackOrderNumber(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl outline-none focus:border-[#C5A059] uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1">
                    Mobile Number (मोबाइल नंबर) *
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-100 text-stone-600 text-xs font-semibold select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={trackPhone}
                      onChange={(e) => setTrackPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      className="w-full p-2.5 border border-stone-300 rounded-r-xl outline-none focus:border-[#C5A059] text-xs font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Vahi mobile number dalein jo order karte waqt dala tha.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={trackLoading}
                  className="w-full min-h-[44px] bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] border border-[#D4AF37]/40 font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  {trackLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  ) : (
                    <>
                      <span>Track Order Status</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 2. Sign In to view all orders */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#EBE6DD] shadow-luxury space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EBE6DD]">
                <Package className="w-5 h-5 text-[#C5A059]" />
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900">
                    Sign In with Mobile Number
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    View all your past & current orders together
                  </p>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleInlineOrdersLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">
                    Mobile Number or Email *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit mobile or email"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-800 font-bold">
                      Password *
                    </label>
                    <span className="text-[10px] text-stone-500 font-normal">
                      (Default: your 10-digit mobile)
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl outline-none focus:border-[#C5A059]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full min-h-[44px] bg-[#FFD814] hover:bg-[#F7CA00] text-stone-900 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 border border-[#FCD200] cursor-pointer"
                >
                  {loginLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                  ) : (
                    <>
                      <span>Sign In & View All Orders</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-stone-700 leading-relaxed">
                  📱 <strong>Naye user hain?</strong> Agar aapne bina account ke order kiya tha, to apna 10-digit mobile number hi username aur password mein dalein.
                </div>
              </form>
            </div>
          </div>

          {/* If tracked order exists, display full details card */}
          {trackedOrder && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-300 shadow-luxury space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Live Order Tracking
                  </span>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Order #{trackedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Placed on {new Date(trackedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {statusMap[trackedOrder.status] || trackedOrder.status}
                  </span>
                  <Link
                    href={`/orders/${trackedOrder.orderNumber}`}
                    className="text-xs font-bold bg-[#0F1D36] text-[#D4AF37] px-4 py-1.5 rounded-lg hover:bg-[#162238] transition-colors"
                  >
                    Full Details →
                  </Link>
                </div>
              </div>

              {/* Items in Tracked Order */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Formulation Items ({trackedOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
                  {trackedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3 sm:p-4 flex items-center justify-between gap-3 bg-stone-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                          <ProductImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-stone-900">{item.name}</p>
                          <p className="text-[11px] text-stone-500">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-stone-900">₹{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-stone-100">
                <div>
                  <span className="font-bold text-stone-700 block mb-1">Delivery Address:</span>
                  <p className="text-stone-600 leading-relaxed">
                    {trackedOrder.shippingAddress?.fullName}<br />
                    {trackedOrder.shippingAddress?.addressLine1}, {trackedOrder.shippingAddress?.city}, {trackedOrder.shippingAddress?.state} - {trackedOrder.shippingAddress?.pincode}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-stone-700 block mb-1">Total Amount & Payment:</span>
                  <p className="text-stone-900 font-bold text-sm">₹{trackedOrder.totalAmount}</p>
                  <p className="text-stone-500 uppercase tracking-wider text-[11px]">Method: {trackedOrder.paymentMethod} • Status: {trackedOrder.paymentStatus}</p>
                  {trackedOrder.shipmentDetails?.trackingNumber && (
                    <p className="text-emerald-800 font-semibold mt-1">
                      Carrier: {trackedOrder.shipmentDetails.carrier} (AWB: {trackedOrder.shipmentDetails.trackingNumber})
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    );
  }

  // Filter orders based on active tab and search
  const filteredOrders = orders.filter((o) => {
    // Tab filter
    if (activeTab === 'not-shipped' && (o.status === 'delivered' || o.status === 'cancelled')) return false;
    if (activeTab === 'cancelled' && o.status !== 'cancelled') return false;
    if (activeTab === 'orders' && o.status === 'cancelled') return false;

    // Search filter
    if (searchTerm) {
      const matchNumber = o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchProduct = o.items?.some((i) =>
        i.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchNumber || matchProduct;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2523]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Triven Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-4">
          <Link href="/" className="hover:text-[#C5A059] hover:underline">
            Home
          </Link>
          <span>›</span>
          <Link href="/account" className="hover:text-[#C5A059] hover:underline">
            Your Account
          </Link>
          <span>›</span>
          <span className="text-stone-800 font-semibold">Your Orders</span>
        </div>

        {/* Triven Orders Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Your Orders
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Track packages, request invoices, or re-order classical formulations
            </p>
          </div>

          {/* Search orders input */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search all orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            />
          </div>
        </div>

        {/* Amazon Orders Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-4 border-b border-stone-200 mb-6 overflow-x-auto text-xs">
          {[
            { id: 'orders', label: 'Orders' },
            { id: 'buy-again', label: 'Buy Again' },
            { id: 'not-shipped', label: 'Not Yet Shipped' },
            { id: 'cancelled', label: 'Cancelled Orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 sm:px-4 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#C5A059] text-stone-900 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter by timeframe */}
        <div className="flex items-center gap-2 mb-6 text-xs text-stone-600">
          <span className="font-semibold text-stone-800">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} placed in
          </span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-800 focus:outline-none shadow-2xs"
          >
            <option value="last-30-days">past 30 days</option>
            <option value="3-months">past 3 months</option>
            <option value="2026">2026</option>
            <option value="archived">Archived Orders</option>
          </select>
        </div>

        {/* Orders List */}
        {loadingOrders ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#C5A059] mx-auto mb-2" />
            <p className="text-xs text-stone-500">Loading your verified order records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-xl mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center mx-auto shadow-sm">
              <Package className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              No orders found in this period
            </h3>
            <p className="text-xs text-stone-500">
              {searchTerm
                ? `We couldn't find any orders matching "${searchTerm}". Try another search term.`
                : "You don't have any past orders in the selected time filter."}
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-block bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#162238] transition-all shadow-sm"
              >
                Start Shopping Classical Remedies
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-stone-300 overflow-hidden shadow-xs"
              >
                {/* TRIVEN ORDER METADATA HEADER STRIP */}
                <div className="bg-stone-100 px-3.5 sm:px-6 py-3 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs text-stone-600">
                  <div className="grid grid-cols-2 xs:flex xs:flex-wrap items-center gap-3.5 sm:gap-10">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold">
                        Order Placed
                      </span>
                      <span className="font-medium text-stone-800">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold">
                        Total
                      </span>
                      <span className="font-bold text-stone-900">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    <div className="relative group col-span-2 xs:col-span-1">
                      <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold">
                        Ship To
                      </span>
                      <span className="font-semibold text-stone-900 flex items-center gap-1 cursor-pointer hover:text-[#8C5E3C] transition-colors">
                        <span>{order.shippingAddress?.fullName || user.name}</span>
                        <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                      </span>
                      {/* Address dropdown card on hover/focus */}
                      <div className="absolute left-0 top-full mt-1.5 hidden group-hover:block z-30 bg-white border border-stone-200 rounded-xl p-3 shadow-xl min-w-[260px] max-w-[320px] text-xs space-y-1">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                          <span className="font-bold text-stone-900">{order.shippingAddress?.fullName || user.name}</span>
                          {order.shippingAddress?.addressType && (
                            <span className="text-[9px] uppercase font-bold bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                              {order.shippingAddress.addressType === 'work' ? 'Office' : 'Home'}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-700 leading-snug">{order.shippingAddress?.addressLine1}</p>
                        {order.shippingAddress?.addressLine2 && <p className="text-stone-600">{order.shippingAddress.addressLine2}</p>}
                        {order.shippingAddress?.landmark && (
                          <p className="text-stone-500 text-[10px]">Landmark: {order.shippingAddress.landmark}</p>
                        )}
                        <p className="text-stone-900 font-semibold">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong>
                        </p>
                        <p className="text-stone-500 text-[10px] pt-1">Phone: {order.shippingAddress?.phone || order.customerDetails?.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold">
                        Order #{order.orderNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="text-[#8C5E3C] font-semibold hover:underline"
                        >
                          View order details
                        </Link>
                        <span className="text-stone-300">|</span>
                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="text-[#8C5E3C] font-semibold hover:underline"
                        >
                          Invoice
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ORDER BODY */}
                <div className="p-4 sm:p-6 divide-y divide-stone-100">
                  {/* Status Banner */}
                  <div className="pb-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                        {order.status === 'delivered' ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
                            <span>Delivered</span>
                          </>
                        ) : order.status === 'cancelled' ? (
                          <span className="text-red-600">Order Cancelled</span>
                        ) : (
                          <>
                            <Truck className="w-5 h-5 text-[#8C5E3C]" />
                            <span>Arriving {new Date(new Date(order.createdAt).getTime() + 86400000 * 2).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          </>
                        )}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Package was handed directly to resident • Triven Prime Logistics
                      </p>
                    </div>

                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <span>Track package</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Items inside this order */}
                  <div className="pt-4 space-y-4">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-stone-200 shrink-0">
                            <ProductImage
                              src={item.image || null}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-semibold text-xs sm:text-sm text-stone-900 line-clamp-1">
                              {item.name}
                            </h5>
                            <p className="text-[11px] text-stone-500">
                              Qty: {item.quantity} • Sold by: <span className="text-stone-700 font-medium">Triven Classical Ayurveda</span>
                            </p>
                            <span className="inline-block text-xs font-bold text-stone-900">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons on the right */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-2 w-full sm:w-44 shrink-0 pt-2 sm:pt-0">
                          <button
                            onClick={() => {
                              addToCart(
                                {
                                  _id: item.productId,
                                  name: item.name,
                                  sellingPrice: item.price,
                                  images: [item.image],
                                  stock: 50,
                                },
                                item.quantity
                              );
                              router.push('/checkout');
                            }}
                            className="flex-1 sm:flex-none bg-[#FFD814] hover:bg-[#F7CA00] text-stone-900 font-bold py-2 px-3 rounded-full text-xs transition-colors text-center border border-[#FCD200] min-h-[38px] flex items-center justify-center"
                          >
                            Buy it again
                          </button>

                          <Link
                            href={`/orders/${order.orderNumber}`}
                            className="flex-1 sm:flex-none border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium py-2 px-3 rounded-full text-xs transition-colors text-center min-h-[38px] flex items-center justify-center"
                          >
                            View your item
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
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
