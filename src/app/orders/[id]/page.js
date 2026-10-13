import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  Printer,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default async function OrderConfirmationPage({ params }) {
  const { id } = await params;
  await connectDB();

  let order = null;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    order = await Order.findById(id).lean();
  } else {
    order = await Order.findOne({ orderNumber: id }).lean();
  }

  if (!order) {
    notFound();
  }

  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', desc: 'Received & Validated' },
    { key: 'processing', label: 'Compounding & Packed', desc: 'Quality checked' },
    { key: 'shipped', label: 'In Transit', desc: order.shipmentDetails?.carrier || 'Express Logistics' },
    { key: 'delivered', label: 'Delivered', desc: 'Doorstep Delivery' },
  ];

  const statusIndexMap = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1,
  };

  const currentStep = statusIndexMap[order.status] ?? 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#1B4332] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-emerald-700" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Order Successfully Placed
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Thank You for Choosing Triven Ayurveda
          </h1>

          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Your classical formulation order <strong>{order.orderNumber}</strong> has been logged authoritatively in our apothecary system. A confirmation email has been dispatched to <strong>{order.customerDetails.email}</strong>.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="min-h-[44px] inline-flex items-center justify-center bg-[#1B4332] text-white text-xs font-semibold px-6 py-2.5 rounded-xl hover:bg-[#2D6A4F] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Shipment Tracker Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#D4AF37]" />
              Fulfillment & Dispatch Tracker
            </h2>
            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Status: {order.status}
            </span>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {steps.map((st, i) => {
              const isDone = i < currentStep;
              const isCurrent = i === currentStep - 1;

              return (
                <div key={st.key} className="space-y-2">
                  <div className={`h-2 rounded-full ${isDone ? 'bg-[#1B4332]' : isCurrent ? 'bg-[#D4AF37]' : 'bg-stone-200'}`} />
                  <p className={`font-bold text-xs ${isDone || isCurrent ? 'text-stone-900' : 'text-stone-400'}`}>
                    {st.label}
                  </p>
                  <p className="text-[11px] text-stone-500">{st.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Tracking info if shipped */}
          {order.shipmentDetails?.trackingNumber && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-900">Carrier: {order.shipmentDetails.carrier}</p>
                <p className="text-stone-600 font-mono mt-0.5">AWB: {order.shipmentDetails.trackingNumber}</p>
              </div>
              <span className="text-emerald-700 font-bold">In Transit</span>
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900 pb-3 border-b border-stone-100">
              Prescribed Medicines
            </h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-stone-900">{item.name}</p>
                    <p className="text-stone-400 text-[11px]">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                  </div>
                  <span className="font-bold text-stone-900">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>- ₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Shipping Fee</span>
                <span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
              </div>
              <div className="flex justify-between text-stone-400 text-[11px]">
                <span>Taxes (GST)</span>
                <span>₹{order.taxAmount}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-[#1B4332]">
                <span>Total Amount</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address & Payment Status */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Delivery Address
              </h3>
              <div className="text-xs text-stone-600 space-y-1 mt-3">
                <p className="font-bold text-stone-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <p className="pt-1 text-stone-500">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h4 className="font-serif font-bold text-sm text-stone-900 mb-2">
                Payment Information
              </h4>
              <div className="text-xs space-y-1">
                <p className="text-stone-700">
                  Method: <strong>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}</strong>
                </p>
                <p className="text-stone-700">
                  Payment Status: <strong className={order.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}>{order.paymentStatus.toUpperCase()}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
