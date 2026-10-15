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
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Star,
  Sparkles,
  MapPin,
} from 'lucide-react';
import ProductImage from '@/components/store/ProductImage';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'buy-again' | 'not-shipped' | 'cancelled'
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('3-months');

  useEffect(() => {
    document.title = 'Your Orders | Triven Ayurveda';
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
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

  if (authLoading || (!user && loadingOrders)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
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
