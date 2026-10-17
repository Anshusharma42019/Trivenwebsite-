'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  Package,
  ArrowRight,
  CreditCard,
  Banknote,
  Loader2,
  RefreshCw,
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Eye,
  Sliders,
  ChevronRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('auto'); // 'auto', 'executive', 'fulfillment'

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch dashboard data');
      }
      setData(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#C5A059]" />
        <span>Aggregating real-time operational metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
        <p className="font-bold">Error loading dashboard:</p>
        <p>{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-4 py-2 bg-red-700 text-white rounded-lg font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const userRole = data?.userRole || user?.role || 'admin';
  const isOrderManagerOnly = userRole === 'order_manager';

  // Determine current view mode
  const currentView = isOrderManagerOnly
    ? 'fulfillment'
    : activeTab === 'fulfillment'
    ? 'fulfillment'
    : 'executive';

  const { summary, statusDistribution, paymentMethodBreakdown, recentOrders, bestsellingProducts } = data;

  // Operational metrics for Order Manager
  const pendingOrdersCount = (statusDistribution.pending || 0) + (statusDistribution.placed || 0);
  const processingCount = (statusDistribution.confirmed || 0) + (statusDistribution.processing || 0);
  const inTransitCount = statusDistribution.shipped || 0;
  const deliveredCount = statusDistribution.delivered || 0;

  return (
    <div className="space-y-8">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0F1D36] text-[#D4AF37] border border-[#D4AF37]/40 shadow-xs inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
              <span>
                {currentView === 'fulfillment'
                  ? 'Order Manager Dashboard'
                  : userRole === 'super_admin'
                  ? 'Super Admin Executive Dashboard'
                  : 'Manager Executive Dashboard'}
              </span>
            </span>
            <span className="text-[11px] text-stone-400">Role: {userRole.replace('_', ' ').toUpperCase()}</span>
          </div>

          <h1 className="font-serif text-2xl font-bold text-stone-900">
            {currentView === 'fulfillment'
              ? 'Order Fulfillment & Logistics Hub'
              : 'Executive Business & Store Dashboard'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {currentView === 'fulfillment'
              ? 'Real-time operational queue, courier dispatches, delivery SLA monitoring, and customer fulfillment tracking.'
              : 'Real-time aggregated sales revenue, inventory health, catalog performance, and customer acquisition.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Executive vs Fulfillment View Switcher (Only visible to Super Admin / Manager) */}
          {!isOrderManagerOnly && (
            <div className="flex items-center bg-stone-200/80 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('executive')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentView === 'executive'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Executive Store View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fulfillment')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentView === 'fulfillment'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Order Fulfillment View
              </button>
            </div>
          )}

          <button
            onClick={fetchDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#8C5E3C]" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORDER MANAGER DEDICATED FULFILLMENT DASHBOARD                         */}
      {/* ========================================================================= */}
      {currentView === 'fulfillment' ? (
        <div className="space-y-6">
          {/* FULFILLMENT OPERATIONAL CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Unfulfilled / Pending Orders (High Priority Alert) */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200/90 shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
              <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
                <span className="font-semibold text-amber-900">New & Pending Dispatch</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4 text-amber-700" />
                </div>
              </div>
              <p className="text-3xl font-bold text-amber-900 font-serif">
                {pendingOrdersCount}
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
                <span>Requires packing/dispatch</span>
                <Link href="/admin/orders?status=pending" className="text-[#8C5E3C] font-bold hover:underline">
                  Action →
                </Link>
              </div>
            </div>

            {/* 2. Processing / Packing Queue */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
                <span className="font-semibold text-stone-700">Packing & Verification</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-stone-900 font-serif">
                {processingCount}
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
                <span>Ready for courier label</span>
                <Link href="/admin/orders?status=processing" className="text-blue-700 font-bold hover:underline">
                  Labels →
                </Link>
              </div>
            </div>

            {/* 3. In-Transit / Shipped with Courier */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
                <span className="font-semibold text-stone-700">On The Road (Shipped)</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-emerald-800 font-serif">
                {inTransitCount}
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
                <span>With tracking AWB</span>
                <Link href="/admin/orders?status=shipped" className="text-emerald-700 font-bold hover:underline">
                  Track →
                </Link>
              </div>
            </div>

            {/* 4. Delivered & Today's Volume */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#C5A059]" />
              <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
                <span className="font-semibold text-stone-700">Delivered Total</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#8C5E3C] flex items-center justify-center">
                  <PackageCheck className="w-4 h-4 text-[#8C5E3C]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-stone-900 font-serif">
                {deliveredCount}
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
                <span>Today's Incoming: <strong>{summary.todayOrders}</strong></span>
                <span className="text-[#C5A059] font-bold">100% Verified</span>
              </div>
            </div>
          </div>

          {/* FULFILLMENT OPERATIONAL WORKFLOW BANNER */}
          <div className="bg-gradient-to-r from-[#0F1D36] via-[#162238] to-[#1B2A4A] text-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                <Truck className="w-3 h-3 text-[#F3E5AB]" />
                <span>Pan-India Courier Dispatch SLA (4-5 Days)</span>
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                Fulfillment Queue & Shipping Label Console
              </h3>
              <p className="text-xs text-stone-300 max-w-xl">
                Inspect order shipping addresses, generate packing manifests, assign BlueDart/Delhivery AWBs, and update shipment statuses.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] hover:brightness-105 text-[#0F1D36] font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 self-start md:self-auto shrink-0 cursor-pointer"
            >
              <span>Manage All Orders & Shipments</span>
              <ArrowRight className="w-4 h-4 text-[#0F1D36]" />
            </Link>
          </div>

          {/* ACTIVE INCOMING ORDERS QUEUE (ORDER MANAGER VIEW) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Live Dispatch & Fulfillment Queue
                </h3>
                <p className="text-xs text-stone-500">
                  Most recent orders requiring customer fulfillment, label generation, or tracking updates
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-[#8C5E3C] hover:text-stone-900 hover:underline inline-flex items-center gap-1"
              >
                <span>View Full Registry ({summary.totalOrders})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Delivery City & PIN</th>
                    <th className="py-3 px-4">Medicines / Items</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        No orders in fulfillment queue.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((ord) => {
                      const firstItem = ord.items?.[0];
                      const remainingCount = (ord.items?.length || 0) - 1;
                      const addr = ord.shippingAddress || {};

                      return (
                        <tr key={ord._id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">
                            <Link href="/admin/orders" className="hover:text-[#8C5E3C]">
                              {ord.orderNumber}
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-stone-800">{ord.customerDetails?.name || 'Customer'}</p>
                            <p className="text-[10px] text-stone-400">{ord.customerDetails?.phone || ord.customerDetails?.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-stone-800 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                              <span>{addr.city || 'India'} {addr.pincode ? `(${addr.pincode})` : ''}</span>
                            </div>
                            <span className="text-[10px] text-stone-400 block truncate max-w-[180px]">
                              {addr.addressLine1 || 'Doorstep Delivery'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-stone-900 truncate max-w-[180px]">
                              {firstItem?.name || 'Item'}
                            </p>
                            <span className="text-[10px] text-stone-500">
                              Qty: {firstItem?.quantity || 1} {remainingCount > 0 && `(+${remainingCount} more)`}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.paymentMethod === 'cod'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {ord.paymentMethod === 'cod' ? 'COD (Collect)' : 'Prepaid (Paid)'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.status === 'delivered'
                                ? 'bg-stone-900 text-[#D4AF37]'
                                : ord.status === 'shipped'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href="/admin/orders"
                              className="px-3 py-1.5 rounded-lg bg-[#0F1D36] hover:bg-[#162238] text-[#D4AF37] font-bold text-[11px] transition-all inline-flex items-center gap-1 shadow-xs"
                            >
                              <span>Process</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. MANAGER / SUPER ADMIN EXECUTIVE DASHBOARD                              */
        /* ========================================================================= */
        <div className="space-y-8">
          {/* EXECUTIVE METRIC CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gross Sales */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
                <span className="font-semibold">Gross Store Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#8C5E3C] flex items-center justify-center font-bold">
                  ₹
                </div>
              </div>
              <p className="text-2xl font-bold text-stone-900 font-serif">
                ₹{summary.grossSales.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                Net Revenue: <strong>₹{summary.netSales.toLocaleString('en-IN')}</strong>
              </p>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
                <span className="font-semibold">Total Orders</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#8C5E3C] flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-stone-900 font-serif">
                {summary.totalOrders}
              </p>
              <p className="text-[11px] text-[#8C5E3C] mt-1 font-semibold">
                Today: {summary.todayOrders} new orders
              </p>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
                <span className="font-semibold">Avg Order Value (AOV)</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D4AF37] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-stone-900 font-serif">
                ₹{summary.aov.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                Discounts Applied: ₹{summary.totalDiscounts}
              </p>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
                <span className="font-semibold">Catalog Stock Alerts</span>
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600 font-serif">
                {summary.lowStockCount} Low
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                {summary.outOfStockCount} items completely out of stock
              </p>
            </div>
          </div>

          {/* ORDER STATUS DISTRIBUTION & PAYMENT BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Distribution */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h2 className="font-serif font-bold text-sm text-stone-900 flex items-center justify-between">
                <span>Fulfillment Pipeline Status</span>
                <Link href="/admin/orders" className="text-xs text-[#8C5E3C] font-semibold hover:text-stone-900 hover:underline">
                  Manage Orders →
                </Link>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-800 font-bold block text-lg font-serif">
                    {statusDistribution.pending || 0}
                  </span>
                  <span className="text-stone-600 font-medium">Pending Payment</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-100 border border-stone-200">
                  <span className="text-stone-900 font-bold block text-lg font-serif">
                    {(statusDistribution.confirmed || 0) + (statusDistribution.processing || 0)}
                  </span>
                  <span className="text-stone-600 font-medium">Processing / Packing</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-300">
                  <span className="text-amber-900 font-bold block text-lg font-serif">
                    {statusDistribution.shipped || 0}
                  </span>
                  <span className="text-stone-600 font-medium">In Transit / Shipped</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 text-white border border-stone-800">
                  <span className="text-[#C5A059] font-bold block text-lg font-serif">
                    {statusDistribution.delivered || 0}
                  </span>
                  <span className="text-stone-300 font-medium">Completed / Delivered</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h2 className="font-serif font-bold text-sm text-stone-900">
                Payment Method Split
              </h2>

              <div className="space-y-3 text-xs">
                {paymentMethodBreakdown.map((pm) => (
                  <div key={pm._id || 'unknown'} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center gap-2">
                      {pm._id === 'cod' ? (
                        <Banknote className="w-4 h-4 text-amber-700" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-[#C5A059]" />
                      )}
                      <span className="font-bold text-stone-800 uppercase">
                        {pm._id === 'cod' ? 'Cash on Delivery' : 'Online (Prepaid)'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-900 block">₹{pm.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-stone-400">{pm.count} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BEST SELLING PRODUCTS (EXECUTIVE VIEW) */}
          {bestsellingProducts && bestsellingProducts.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Top Bestselling Classical Formulations
                </h3>
                <Link href="/admin/products" className="text-xs text-[#8C5E3C] font-semibold hover:underline">
                  Manage Catalog ({summary.totalProducts || 'All'}) →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {bestsellingProducts.map((p) => (
                  <div key={p._id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-stone-900 text-xs line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">{p.dosageForm || 'Classical'}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900">₹{p.sellingPrice}</span>
                      <span className="text-[10px] text-stone-500 font-medium">Stock: {p.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENT ORDERS TABLE (EXECUTIVE OVERVIEW) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-serif font-bold text-base text-stone-900">
                Recent Store Transactions
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-[#8C5E3C] hover:text-stone-900 hover:underline"
              >
                View All ({summary.totalOrders}) →
              </Link>
            </div>

            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 min-w-[200px]">Ordered Products</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-400">
                        No orders logged yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((ord) => {
                      const firstItem = ord.items?.[0];
                      const remainingCount = (ord.items?.length || 0) - 1;
                      return (
                        <tr key={ord._id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">
                            <Link href="/admin/orders" className="hover:text-[#8C5E3C] transition-colors">
                              {ord.orderNumber}
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-stone-800">{ord.customerDetails?.name || 'Customer'}</p>
                            <p className="text-stone-400 text-[10px]">{ord.customerDetails?.phone || ord.customerDetails?.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1.5 shrink-0">
                                {ord.items?.slice(0, 2).map((it, idx) => (
                                  <div
                                    key={idx}
                                    className="w-7 h-7 rounded-md border border-white bg-stone-100 overflow-hidden shrink-0 shadow-2xs"
                                    title={`${it.name} (${it.quantity}x)`}
                                  >
                                    {it.image ? (
                                      <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-500 font-bold text-[8px]">
                                        AYUR
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-stone-800 text-[11px] truncate max-w-[150px]">
                                  {firstItem?.name || 'Item'}
                                </p>
                                <span className="text-[9px] text-stone-400">
                                  Qty: {firstItem?.quantity || 1} {remainingCount > 0 && `(+${remainingCount} more)`}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-stone-500">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.paymentMethod === 'cod' ? 'bg-stone-100 text-stone-700' : 'bg-emerald-50 text-emerald-800'
                            }`}>
                              {ord.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-stone-900">
                            ₹{ord.totalAmount}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href="/admin/orders"
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] transition-colors"
                            >
                              Details →
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
