'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch executive dashboard');
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
        <span>Aggregating real-time MongoDB analytics...</span>
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
          className="mt-3 px-4 py-2 bg-red-700 text-white rounded-lg font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, statusDistribution, paymentMethodBreakdown, recentOrders, bestsellingProducts } = data;

  return (
    <div className="space-y-8">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Executive Business Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time aggregated sales, inventory thresholds, and fulfillment velocity.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#8C5E3C]" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>Gross Revenue</span>
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
            <span>Total Orders</span>
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
            <span>Avg Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D4AF37] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 font-serif">
            ₹{summary.aov.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            Discounts: ₹{summary.totalDiscounts}
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-2">
            <span>Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 font-serif">
            {summary.lowStockCount} Low
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            {summary.outOfStockCount} items out of stock
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
                    {pm._id === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}
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

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-serif font-bold text-base text-stone-900">
            Recent Incoming Orders
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
                        <p className="font-semibold text-stone-800">{ord.customerDetails.name}</p>
                        <p className="text-stone-400 text-[10px]">{ord.customerDetails.phone || ord.customerDetails.email}</p>
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
                          Fulfill →
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
  );
}
