'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Package,
  CreditCard,
  Banknote,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Copy,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  confirmed: 'bg-blue-100 text-blue-900 border-blue-300',
  processing: 'bg-purple-100 text-purple-900 border-purple-300',
  shipped: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  cancelled: 'bg-red-100 text-red-900 border-red-300',
  returned: 'bg-rose-100 text-rose-900 border-rose-300',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
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
  const [copiedText, setCopiedText] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (paymentFilter) params.set('paymentStatus', paymentFilter);
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
  }, [statusFilter, paymentFilter, search]);

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

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

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

      setMsg(`Order ${selectedOrder.orderNumber} successfully updated to ${statusUpdateForm.status}`);
      setTimeout(() => setMsg(null), 3500);
      setSelectedOrder(json.data);
      fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      alert('Please allow popups to print order invoice.');
      return;
    }

    const itemsHtml = (order.items || [])
      .map(
        (it, idx) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 8px; font-size: 13px;">${idx + 1}</td>
          <td style="padding: 10px 8px; font-size: 13px;">
            <strong>${it.name}</strong><br>
            <span style="font-size: 11px; color: #6b7280;">SKU: ${it.sku || 'N/A'}</span>
          </td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: center;">${it.quantity}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: right;">₹${it.unitPrice}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: right; font-weight: bold;">₹${it.totalPrice}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderNumber} - Triven Ayurveda</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #8C5E3C; padding-bottom: 16px; margin-bottom: 24px; }
            .logo-title { font-size: 24px; font-weight: bold; color: #18181B; }
            .logo-sub { font-size: 12px; color: #8C5E3C; text-transform: uppercase; letter-spacing: 1px; }
            .invoice-tag { text-align: right; }
            .invoice-num { font-size: 18px; font-weight: bold; color: #18181B; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; font-size: 13px; }
            .card { background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .card h4 { margin: 0 0 8px 0; color: #374151; font-size: 12px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #f3f4f6; text-align: left; padding: 10px 8px; font-size: 12px; text-transform: uppercase; color: #4b5563; }
            .summary { margin-left: auto; width: 280px; font-size: 13px; }
            .summary-row { display: flex; justify-content: space-between; padding: 4px 0; }
            .summary-total { font-size: 16px; font-weight: bold; border-top: 2px solid #111827; padding-top: 8px; margin-top: 8px; }
            .footer { margin-top: 40px; border-top: 1px dashed #d1d5db; padding-top: 16px; text-align: center; font-size: 11px; color: #6b7280; }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-title">TRIVEN AYURVEDA</div>
              <div class="logo-sub">Classical Vedic Medicines & Apothecary</div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">TrivenAyurveda.com | Customer Care: +91 7309523829</div>
            </div>
            <div class="invoice-tag">
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">TAX INVOICE & DISPATCH SLIP</div>
              <div class="invoice-num">${order.orderNumber}</div>
              <div style="font-size: 12px; color: #6b7280;">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div style="font-size: 12px; font-weight: bold; color: ${order.paymentMethod === 'cod' ? '#b45309' : '#047857'}; margin-top: 4px;">
                ${order.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PAID ONLINE (RAZORPAY)'}
              </div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <h4>Shipping Destination</h4>
              <strong>${order.shippingAddress?.fullName || order.customerDetails?.name}</strong>${order.shippingAddress?.addressType ? ` <span style="font-size: 10px; background: #e5e7eb; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${order.shippingAddress.addressType}</span>` : ''}<br>
              ${order.shippingAddress?.addressLine1 || ''}<br>
              ${order.shippingAddress?.addressLine2 ? `${order.shippingAddress.addressLine2}<br>` : ''}
              ${order.shippingAddress?.landmark ? `Landmark: ${order.shippingAddress.landmark}<br>` : ''}
              ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - <strong>${order.shippingAddress?.pincode}</strong> (${order.shippingAddress?.country || 'India'})<br>
              Phone: <strong>${order.shippingAddress?.phone || order.customerDetails?.phone}</strong>
            </div>

            <div class="card">
              <h4>Customer Details & Billing</h4>
              Customer: <strong>${order.customerDetails?.name}</strong><br>
              Email: ${order.customerDetails?.email}<br>
              Phone: ${order.customerDetails?.phone}<br>
              Payment Status: <strong>${(order.paymentStatus || 'pending').toUpperCase()}</strong><br>
              ${order.paymentDetails?.razorpayPaymentId ? `Razorpay Ref: ${order.paymentDetails.razorpayPaymentId}<br>` : ''}
              Fulfillment Status: <strong>${(order.status || 'pending').toUpperCase()}</strong>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Ordered Formulation</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 100px;">Price</th>
                <th style="text-align: right; width: 120px;">Item Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row"><span>Items Subtotal:</span><span>₹${order.subtotal}</span></div>
            ${order.discountAmount > 0 ? `<div class="summary-row" style="color: #b45309;"><span>Discount (${order.couponCode || 'Promo'}):</span><span>-₹${order.discountAmount}</span></div>` : ''}
            <div class="summary-row"><span>Delivery / Shipping:</span><span>₹${order.shippingCharge || 0}</span></div>
            <div class="summary-row"><span>GST / Taxes:</span><span>₹${order.taxAmount || 0}</span></div>
            <div class="summary-row summary-total"><span>Grand Total:</span><span>₹${order.totalAmount}</span></div>
          </div>

          <div class="footer">
            Thank you for choosing pure Vedic health with Triven Ayurveda. Handcrafted with traditional shastra protocols.<br>
            For delivery questions or doctor consultation: support@trivenayurveda.com
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-[#8C5E3C]" />
            Order Fulfillment & Logistics
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time customer orders, ordered product previews, dispatch details, and courier tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <div className="text-xs text-stone-700 bg-white border border-stone-200 px-4 py-2 rounded-xl font-bold shadow-2xs">
            Total Orders: <span className="text-[#8C5E3C]">{total}</span>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, Phone, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#8C5E3C]/30 focus:border-[#8C5E3C] transition-all"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 rounded-xl border border-stone-300 bg-white font-medium text-xs focus:ring-2 focus:ring-[#8C5E3C]/30"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-semibold">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="p-2 rounded-xl border border-stone-300 bg-white font-medium text-xs focus:ring-2 focus:ring-[#8C5E3C]/30"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending / COD</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[980px]">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 min-w-[260px]">Ordered Products</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-stone-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C5A059]" />
                    <span>Loading real-time orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="font-semibold text-stone-600 text-sm">No orders matching criteria.</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">When customers place orders, they will appear here instantly.</p>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const totalItemsCount = ord.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;
                  const firstItem = ord.items?.[0];
                  const remainingCount = (ord.items?.length || 0) - 1;

                  return (
                    <tr key={ord._id} className="hover:bg-amber-50/20 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <button
                          onClick={() => handleOpenDetail(ord)}
                          className="font-bold text-stone-900 hover:text-[#8C5E3C] transition-colors text-left flex items-center gap-1 group"
                        >
                          <span>{ord.orderNumber}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#8C5E3C]" />
                        </button>
                        <p className="text-[10px] text-stone-500 font-sans mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-stone-900">{ord.customerDetails?.name}</p>
                        <p className="text-stone-500 text-[11px]">{ord.customerDetails?.phone}</p>
                        <p className="text-stone-400 text-[10px] truncate max-w-[150px]">{ord.customerDetails?.email}</p>
                      </td>

                      {/* Ordered Products (Rich Preview) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          {/* Image preview */}
                          <div className="flex -space-x-2 shrink-0">
                            {ord.items?.slice(0, 3).map((it, idx) => (
                              <div
                                key={idx}
                                className="w-10 h-10 rounded-lg border-2 border-white bg-stone-100 overflow-hidden shrink-0 shadow-2xs relative"
                                title={`${it.name} (${it.quantity}x)`}
                              >
                                {it.image ? (
                                  <img
                                    src={it.image}
                                    alt={it.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Product names description */}
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 text-[11px] truncate max-w-[200px]" title={firstItem?.name}>
                              {firstItem ? `${firstItem.name} (x${firstItem.quantity})` : 'Product item'}
                            </p>
                            <p className="text-[10px] text-stone-500">
                              {remainingCount > 0 ? (
                                <span className="text-[#8C5E3C] font-semibold">+{remainingCount} more item{remainingCount > 1 ? 's' : ''} ({totalItemsCount} total units)</span>
                              ) : (
                                <span>{totalItemsCount} unit{totalItemsCount > 1 ? 's' : ''} ordered</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="font-semibold text-stone-900 text-[11px] truncate flex items-center gap-1" title={ord.shippingAddress?.addressLine1}>
                          <MapPin className="w-3 h-3 text-[#C5A059] shrink-0" />
                          <span className="truncate">{ord.shippingAddress?.addressLine1 || ord.shippingAddress?.city}</span>
                        </p>
                        <p className="text-[10px] text-stone-500 truncate pl-4">
                          {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - <strong className="text-stone-800">{ord.shippingAddress?.pincode}</strong>
                        </p>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              ord.paymentMethod === 'cod'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {ord.paymentMethod === 'cod' ? (
                              <>
                                <Banknote className="w-3 h-3" />
                                <span>COD</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3 h-3" />
                                <span>Razorpay</span>
                              </>
                            )}
                          </span>

                          <span
                            className={`block text-[9px] font-bold uppercase tracking-wider ${
                              ord.paymentStatus === 'paid'
                                ? 'text-emerald-700'
                                : ord.paymentStatus === 'failed'
                                ? 'text-red-700'
                                : 'text-stone-500'
                            }`}
                          >
                            ● {ord.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-bold text-stone-900 text-sm">
                        ₹{ord.totalAmount}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            STATUS_COLORS[ord.status] || 'bg-stone-100 text-stone-800 border-stone-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{ord.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePrintInvoice(ord)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            title="Print Invoice / Packing Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenDetail(ord)}
                            className="px-3 py-1.5 rounded-lg bg-[#18181B] text-[#C5A059] border border-[#C5A059]/40 hover:bg-stone-900 font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <span>Manage</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAIL & STATUS UPDATE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 space-y-6 my-auto border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                    Order Details: {selectedOrder.orderNumber}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      STATUS_COLORS[selectedOrder.status] || 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                  <span>Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}</span>
                  <span>•</span>
                  <span className="font-mono text-stone-400">Order ID: {selectedOrder._id}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#8C5E3C]" />
                  <span>Print Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ORDERED PRODUCTS LIST (PROPER VISUAL DISPLAY) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#8C5E3C]" />
                  Ordered Ayurvedic Formulations ({selectedOrder.items?.length || 0} Products)
                </h3>
                <span className="text-xs font-semibold text-stone-500">
                  Total Items: {selectedOrder.items?.reduce((acc, it) => acc + (it.quantity || 1), 0)} units
                </span>
              </div>

              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/40">
                {selectedOrder.items?.map((it, i) => (
                  <div key={i} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-xl border border-stone-200 bg-white overflow-hidden shrink-0 shadow-2xs">
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 text-xs sm:text-sm">{it.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono bg-stone-200/70 text-stone-700 px-1.5 py-0.5 rounded">
                            SKU: {it.sku || 'N/A'}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            Unit Price: ₹{it.unitPrice}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 text-xs border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                      <div className="text-left sm:text-right">
                        <span className="text-stone-400 text-[10px] block uppercase font-bold">Quantity</span>
                        <span className="font-bold text-stone-800 text-xs bg-stone-100 px-2 py-0.5 rounded-md">
                          × {it.quantity}
                        </span>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <span className="text-stone-400 text-[10px] block uppercase font-bold">Subtotal</span>
                        <span className="font-bold text-stone-900 text-sm">
                          ₹{it.totalPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TWO-COLUMN DETAILS: CUSTOMER & FINANCIALS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Customer & Shipping Address */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 text-xs uppercase tracking-wider block border-b border-stone-200 pb-2">
                  Customer & Delivery Address
                </span>
                <div>
                  <p className="font-bold text-stone-900 text-sm">
                    {selectedOrder.shippingAddress?.fullName || selectedOrder.customerDetails?.name}
                  </p>
                  <p className="text-stone-600 mt-0.5">{selectedOrder.shippingAddress?.addressLine1}</p>
                  {selectedOrder.shippingAddress?.addressLine2 && (
                    <p className="text-stone-600">{selectedOrder.shippingAddress?.addressLine2}</p>
                  )}
                  {selectedOrder.shippingAddress?.landmark && (
                    <p className="text-stone-500 text-[11px]">Landmark: {selectedOrder.shippingAddress.landmark}</p>
                  )}
                  <p className="text-stone-900 font-semibold mt-1">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - <span className="text-[#8C5E3C]">{selectedOrder.shippingAddress?.pincode}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200 space-y-1">
                  <p className="text-stone-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <a href={`tel:${selectedOrder.customerDetails?.phone}`} className="hover:underline">
                        {selectedOrder.customerDetails?.phone}
                      </a>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedOrder.customerDetails?.phone, 'phone')}
                      className="text-stone-400 hover:text-stone-700 text-[10px]"
                    >
                      {copiedText === 'phone' ? 'Copied!' : 'Copy'}
                    </button>
                  </p>

                  <p className="text-stone-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <a href={`mailto:${selectedOrder.customerDetails?.email}`} className="hover:underline truncate">
                        {selectedOrder.customerDetails?.email}
                      </a>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedOrder.customerDetails?.email, 'email')}
                      className="text-stone-400 hover:text-stone-700 text-[10px]"
                    >
                      {copiedText === 'email' ? 'Copied!' : 'Copy'}
                    </button>
                  </p>
                </div>
              </div>

              {/* Payment & Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 text-xs uppercase tracking-wider block border-b border-stone-200 pb-2">
                  Payment & Financial Breakdown
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Payment Method:</span>
                  <span className="font-bold text-stone-900 uppercase">
                    {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay Online'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Payment Status:</span>
                  <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                    selectedOrder.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>

                {selectedOrder.paymentDetails?.razorpayPaymentId && (
                  <div className="flex items-center justify-between text-[11px] font-mono bg-white p-1.5 rounded-lg border border-stone-200">
                    <span className="text-stone-400">Payment ID:</span>
                    <span className="font-bold text-stone-800">{selectedOrder.paymentDetails.razorpayPaymentId}</span>
                  </div>
                )}

                <div className="space-y-1 pt-2 border-t border-stone-200 text-stone-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-amber-800 font-semibold">
                      <span>Discount ({selectedOrder.couponCode || 'Coupon'}):</span>
                      <span>-₹{selectedOrder.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping / Delivery:</span>
                    <span>₹{selectedOrder.shippingCharge || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes / GST:</span>
                    <span>₹{selectedOrder.taxAmount || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 text-sm pt-2 border-t border-stone-200">
                    <span>Grand Total:</span>
                    <span className="text-[#8C5E3C]">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STATUS UPDATE & TRACKING FORM */}
            <form onSubmit={handleUpdateStatus} className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4 text-xs">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#8C5E3C]" />
                Update Fulfillment & Courier Tracking
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Status Transition</label>
                  <select
                    value={statusUpdateForm.status}
                    onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-[#8C5E3C]/30"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing / Compounding</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled (Restocks Inventory)</option>
                    <option value="returned">Returned (Restocks Inventory)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Courier Carrier</label>
                  <input
                    type="text"
                    value={statusUpdateForm.carrier}
                    onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, carrier: e.target.value })}
                    placeholder="e.g. BlueDart, Shiprocket, DTDC, Delhivery"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#8C5E3C]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Air Waybill / Tracking Number</label>
                  <input
                    type="text"
                    value={statusUpdateForm.trackingNumber}
                    onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, trackingNumber: e.target.value })}
                    placeholder="e.g. AWB-99882211"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono focus:ring-2 focus:ring-[#8C5E3C]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Internal Note / Dispatch Remarks</label>
                  <input
                    type="text"
                    value={statusUpdateForm.note}
                    onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, note: e.target.value })}
                    placeholder="e.g. Package inspected, packed with moisture barrier and sealed."
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#8C5E3C]/30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-[#18181B] hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/40 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Status Transition</span>
                </button>
              </div>
            </form>

            {/* STATUS HISTORY TIMELINE */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="space-y-2 text-xs pt-2">
                <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px] block">
                  Status Audit Trail
                </span>
                <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 space-y-2">
                  {selectedOrder.statusHistory.map((sh, idx) => (
                    <div key={idx} className="flex items-start justify-between text-[11px] pb-2 border-b border-stone-200/60 last:border-b-0 last:pb-0">
                      <div>
                        <span className="font-bold uppercase text-stone-900">{sh.status}</span>
                        {sh.note && <p className="text-stone-500 italic mt-0.5">{sh.note}</p>}
                        <span className="text-[10px] text-stone-400">By: {sh.updatedBy || 'Staff'}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(sh.updatedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
