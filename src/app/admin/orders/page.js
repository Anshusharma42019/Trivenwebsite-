'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Check,
  Truck,
  Printer,
  X,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: '',
    note: '',
    trackingNumber: '',
    carrier: 'BlueDart Express',
  });
  const [msg, setMsg] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setOrders(json.data.orders || []);
        setTotal(json.data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedOrder) {
        setSelectedOrder(null);
      }
    };
    if (selectedOrder) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOrder]);

  const handleOpenDetail = (ord) => {
    setSelectedOrder(ord);
    setStatusUpdateForm({
      status: ord.status,
      note: '',
      trackingNumber: ord.shipmentDetails?.trackingNumber || '',
      carrier: ord.shipmentDetails?.carrier || 'BlueDart Express',
    });
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusUpdateForm),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update order status');
      }

      setMsg(`Order ${selectedOrder.orderNumber} updated to ${statusUpdateForm.status}`);
      setTimeout(() => setMsg(null), 3000);
      setSelectedOrder(json.data);
      fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Order Fulfillment & Logistics
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Process orders, assign logistics tracking numbers, and view complete audit records.
          </p>
        </div>

        <div className="text-xs text-stone-600 bg-white border border-stone-200 px-4 py-2 rounded-xl font-bold self-start">
          Total Orders Logged: {total}
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search Order Number, Customer, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="text-stone-500 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-stone-300 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B4332]" />
                    <span>Loading orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No orders matching criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <p className="font-bold text-stone-900">{ord.orderNumber}</p>
                      <p className="text-[10px] text-stone-400">{new Date(ord.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-stone-900">{ord.customerDetails?.name}</p>
                      <p className="text-stone-500 text-[10px]">{ord.customerDetails?.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                        {ord.items?.length || 0} Products
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900 text-sm">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.paymentStatus} ({ord.paymentMethod})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-800 border border-stone-200">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(ord)}
                        className="px-3 py-1.5 rounded-lg bg-[#1B4332] text-white hover:bg-[#2D6A4F] font-semibold text-xs transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAIL & STATUS UPDATE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-8 space-y-6 my-auto border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                  Order Management: {selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-stone-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery address & items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-stone-800 block mb-1">Customer & Address:</span>
                <p className="font-semibold text-stone-900">{selectedOrder.customerDetails?.name}</p>
                <p className="text-stone-600">{selectedOrder.shippingAddress?.addressLine1}</p>
                <p className="text-stone-600">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                </p>
                <p className="text-stone-500 pt-1">Phone: {selectedOrder.customerDetails?.phone}</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-stone-800 block mb-1">Financial Breakdown:</span>
                <p className="text-stone-600">Subtotal: ₹{selectedOrder.subtotal}</p>
                {selectedOrder.discountAmount > 0 && (
                  <p className="text-emerald-700 font-semibold">Discount: -₹{selectedOrder.discountAmount} ({selectedOrder.couponCode})</p>
                )}
                <p className="text-stone-600">Shipping: ₹{selectedOrder.shippingCharge}</p>
                <p className="text-stone-600">Taxes: ₹{selectedOrder.taxAmount}</p>
                <p className="font-bold text-stone-900 text-sm pt-1">Total: ₹{selectedOrder.totalAmount}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-stone-800 block">Ordered Medicines:</span>
              <div className="space-y-2 border border-stone-200 rounded-xl p-3 bg-stone-50/50">
                {selectedOrder.items?.map((it, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-stone-900">{it.name}</p>
                      <p className="text-stone-400 font-mono text-[10px]">SKU: {it.sku} (Qty: {it.quantity})</p>
                    </div>
                    <span className="font-semibold text-stone-900">₹{it.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 text-xs">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#1B4332]" />
                Update Fulfillment Status & Shipping Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Status Transition</label>
                  <select
                    value={statusUpdateForm.status}
                    onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing / Compounding</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled (Replenishes Stock)</option>
                    <option value="returned">Returned (Replenishes Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Logistics Carrier</label>
                  <input
                    type="text"
                    value={statusUpdateForm.carrier}
                    onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, carrier: e.target.value })}
                    placeholder="e.g. Shiprocket, BlueDart, DTDC"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Tracking Number / AWB</label>
                  <input
                    type="text"
                    value={statusUpdateForm.trackingNumber}
                    onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, trackingNumber: e.target.value })}
                    placeholder="e.g. AWB-99882211"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Internal Transition Note</label>
                  <input
                    type="text"
                    value={statusUpdateForm.note}
                    onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, note: e.target.value })}
                    placeholder="e.g. Dispatched from Haridwar warehouse"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Status Transition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
