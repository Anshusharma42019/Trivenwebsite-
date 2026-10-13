'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import AddressMapPicker from '@/components/store/AddressMapPicker';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  Trash2,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Tag,
  Loader2,
  Bookmark,
  MapPin,
  Lock,
  Navigation,
  Home,
  Building,
  Edit2,
  Plus,
  ChevronRight,
  User,
} from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart, isLoaded } = useCart();
  const { user, login, refreshUser } = useAuth();
  const { toggleWishlist } = useWishlist();

  // Saved address selection state in checkout
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewInCheckout, setIsAddingNewInCheckout] = useState(false);

  // In-line Login state for unauthenticated users
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Address and customer state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    fullName: user?.name || '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: 'Haridwar',
    state: 'Uttarakhand',
    pincode: '249401',
    addressType: 'home', // 'home' | 'work'
  });

  // Map location state
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);

  // Address confirmation status
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);

  // Pincode validation state
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Authoritative server calculation state
  const [serverCalculation, setServerCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    document.title = 'Triven Ayurveda Checkout - Select Address & Payment';
    loadRazorpayScript();
  }, []);

  // Auto-populate from user if logged in
  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (defaultAddr && defaultAddr.addressLine1) {
        setSelectedAddressId(defaultAddr._id);
        setFormData((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          phone: defaultAddr.phone || user.phone || prev.phone,
          fullName: defaultAddr.fullName || user.name || prev.fullName,
          addressLine1: defaultAddr.addressLine1,
          addressLine2: defaultAddr.addressLine2 || '',
          landmark: defaultAddr.landmark || '',
          city: defaultAddr.city || 'Haridwar',
          state: defaultAddr.state || 'Uttarakhand',
          pincode: defaultAddr.pincode || '249401',
          addressType: defaultAddr.type || 'home',
        }));
        setIsAddressConfirmed(true);
      } else {
        setSelectedAddressId(null);
        setFormData((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          fullName: user.name || prev.fullName,
          addressLine1: '',
          addressLine2: '',
          landmark: '',
          city: 'Haridwar',
          state: 'Uttarakhand',
          pincode: '249401',
          addressType: 'home',
        }));
        setIsAddressConfirmed(false);
      }
    }
  }, [user]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setFormData((prev) => ({
      ...prev,
      fullName: addr.fullName || user?.name || prev.fullName,
      phone: addr.phone || user?.phone || prev.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      city: addr.city || 'Haridwar',
      state: addr.state || 'Uttarakhand',
      pincode: addr.pincode || '249401',
      addressType: addr.type || 'home',
    }));
    try {
      if (addr.pincode) localStorage.setItem('triven_pincode', addr.pincode);
      if (addr.city) localStorage.setItem('triven_city', addr.city);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
    setIsAddressConfirmed(true);
    setIsAddingNewInCheckout(false);
  };

  // Check pincode serviceability
  const handlePincodeBlur = async () => {
    if (formData.pincode && formData.pincode.length === 6) {
      setCheckingPincode(true);
      setPincodeStatus(null);
      try {
        const res = await fetch(`/api/pincodes/check?pincode=${formData.pincode}`);
        const data = await res.json();
        if (res.ok && data.data?.serviceable) {
          setPincodeStatus(data.data);
          if (data.data.city && data.data.city !== 'India') {
            setFormData((prev) => ({
              ...prev,
              city: data.data.city,
              state: data.data.state || prev.state,
            }));
          }
        } else {
          setPincodeStatus({ serviceable: false, message: data.error });
        }
      } catch (e) {
        setPincodeStatus({ serviceable: true, message: 'Standard 1-Day delivery available' });
      } finally {
        setCheckingPincode(false);
      }
    }
  };

  // Callback from AddressMapPicker
  const handleLocationPicked = (loc) => {
    setMapLocation(loc);
    setFormData((prev) => ({
      ...prev,
      pincode: loc.pincode || prev.pincode,
      city: loc.city || prev.city,
      state: loc.state || prev.state,
      addressLine2: loc.locality || prev.addressLine2,
    }));
  };

  // Confirm delivery address step
  const handleConfirmAddress = async (e) => {
    if (e) e.preventDefault();
    if (!formData.fullName.trim()) {
      alert('Please enter recipient full name');
      return;
    }
    if (!formData.phone || formData.phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number for delivery');
      return;
    }
    if (!formData.addressLine1.trim()) {
      alert('Please enter your flat / house number and street');
      return;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      alert('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    setIsAddressConfirmed(true);
    setIsAddingNewInCheckout(false);

    try {
      if (formData.pincode) localStorage.setItem('triven_pincode', formData.pincode);
      if (formData.city) localStorage.setItem('triven_city', formData.city);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    // Auto-save address to user profile if logged in
    if (user) {
      try {
        await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            phone: formData.phone,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            type: formData.addressType,
          }),
        });
        if (refreshUser) refreshUser();
      } catch (err) {
        console.error('Failed to auto-save address', err);
      }
    }
  };

  // In-line Login Handler
  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Recalculate totals on server whenever items or coupon or payment method change
  useEffect(() => {
    if (!isLoaded || items.length === 0) return;

    let isMounted = true;
    const recalculate = async () => {
      setCalculating(true);
      setOrderError(null);
      try {
        const res = await fetch('/api/orders/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            couponCode: appliedCoupon || null,
            paymentMethod,
          }),
        });

        const json = await res.json();
        if (isMounted) {
          if (res.ok) {
            setServerCalculation(json.data);
          } else {
            setOrderError(json.error);
          }
        }
      } catch (err) {
        if (isMounted) setOrderError('Failed to calculate cart totals');
      } finally {
        if (isMounted) setCalculating(false);
      }
    };

    recalculate();
    return () => {
      isMounted = false;
    };
  }, [items, appliedCoupon, paymentMethod, isLoaded]);

  // Apply Coupon handler
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartTotal: serverCalculation?.subtotal || 1000,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Invalid coupon code');
      }

      setAppliedCoupon(json.data.code);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Place Order handler (Amazon strict login enforcement)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Strict Amazon login requirement
    if (!user) {
      alert('Sign-in required: Please sign in to your Triven Ayurveda account to place this order.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!isAddressConfirmed) {
      alert('Please confirm your delivery address before placing your order.');
      return;
    }

    setPlacingOrder(true);
    setOrderError(null);

    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerDetails: {
          name: formData.name || user.name,
          email: formData.email || user.email,
          phone: formData.phone || user.phone || '9876543210',
        },
        shippingAddress: {
          fullName: formData.fullName || formData.name || user.name,
          phone: formData.phone || user.phone || '9876543210',
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || '',
          landmark: formData.landmark || '',
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India',
          addressType: formData.addressType || 'home',
          coordinates: mapLocation?.coordinates || null,
        },
        paymentMethod,
        couponCode: appliedCoupon || null,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to place order');
      }

      const createdOrder = json.data.order;
      const razorpayOrder = json.data.razorpayOrder;
      const razorpayKey = json.data.razorpayKey || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_Tmwfe9B3ZvyIpR';

      // If Razorpay online payment chosen
      if (paymentMethod === 'razorpay' && razorpayOrder) {
        // Fallback for simulation mode (e.g. if test simulated order)
        if (razorpayOrder.isSimulated) {
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: createdOrder._id,
              razorpayOrderId: razorpayOrder.id,
              razorpayPaymentId: `pay_sim_${Date.now()}`,
              razorpaySignature: 'simulated_success_signature',
            }),
          });
          const verifyJson = await verifyRes.json();
          if (!verifyRes.ok) {
            throw new Error(verifyJson.error || 'Payment verification failed');
          }
          clearCart();
          router.push(`/orders/${createdOrder.orderNumber}`);
          return;
        }

        // Live Razorpay Gateway Modal
        const isScriptReady = await loadRazorpayScript();
        if (!isScriptReady || !window.Razorpay) {
          throw new Error(
            'Failed to load Razorpay payment gateway. Please check your internet connection or choose Cash on Delivery.'
          );
        }

        const options = {
          key: razorpayKey,
          amount: razorpayOrder.amount, // in paise
          currency: razorpayOrder.currency || 'INR',
          name: 'Triven Ayurveda',
          description: `Order #${createdOrder.orderNumber} - Pure Classical Vedic Formulations`,
          image: '/favicon.ico',
          order_id: razorpayOrder.id,
          handler: async function (response) {
            try {
              setPlacingOrder(true);
              const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: createdOrder._id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyJson = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyJson.error || 'Payment signature verification failed.');
              }

              clearCart();
              router.push(`/orders/${createdOrder.orderNumber}`);
            } catch (vErr) {
              setOrderError(`Payment verification failed: ${vErr.message}`);
              setPlacingOrder(false);
            }
          },
          prefill: {
            name: formData.fullName || formData.name || user.name || '',
            email: formData.email || user.email || '',
            contact: formData.phone || user.phone || '',
            method: 'upi', // Direct UPI App intent
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'Pay with Google Pay, PhonePe, Paytm or UPI QR',
                  instruments: [
                    {
                      method: 'upi',
                      flows: ['intent', 'qr', 'collect'],
                      apps: ['google_pay', 'phonepe', 'paytm', 'bhim'],
                    },
                  ],
                },
                other: {
                  name: 'Cards & Netbanking',
                  instruments: [
                    { method: 'card' },
                    { method: 'netbanking' },
                    { method: 'wallet' },
                  ],
                },
              },
              sequence: ['block.upi', 'block.other'],
              preferences: {
                show_default_blocks: false,
              },
            },
          },
          theme: {
            color: '#1B4332', // Triven Vedic Dark Forest Green
          },
          modal: {
            ondismiss: function () {
              setPlacingOrder(false);
              setOrderError(
                `Payment window closed. Order #${createdOrder.orderNumber} has been logged with Pending status. You can retry payment or choose Cash on Delivery.`
              );
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setPlacingOrder(false);
          setOrderError(`Payment Failed: ${resp.error?.description || 'Transaction declined by bank or UPI app.'}`);
        });

        rzp.open();
        setPlacingOrder(false);
        return;
      }

      // Cash on Delivery direct confirmation
      clearCart();
      router.push(`/orders/${createdOrder.orderNumber}`);
    } catch (err) {
      setOrderError(err.message);
      setPlacingOrder(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4332]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center flex-1">
          <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-3xl mx-auto mb-4 font-serif">
            🛒
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-xs text-stone-500 mb-6">
            Looks like you haven't added any classical Ayurvedic remedies to your cart yet.
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#1B4332] text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md hover:bg-[#2D6A4F] transition-all"
          >
            Browse Classical Medicines
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Standard Store Navbar with Mobile Bottom Bar */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 w-full pb-24 md:pb-8">
        {orderError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: 3-Step Amazon Checkout Flow (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* ================= STEP 1: SIGN-IN REQUIREMENT ================= */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      user ? 'bg-emerald-100 text-emerald-800' : 'bg-[#1B4332] text-white'
                    }`}
                  >
                    {user ? '✓' : '1'}
                  </span>
                  <div>
                    <h2 className="font-serif font-bold text-base text-stone-900">
                      Step 1: Sign in to your Account
                    </h2>
                    <p className="text-xs text-stone-500">
                      {user
                        ? `Signed in as ${user.name} (${user.email})`
                        : 'Amazon-standard verified authentication required for doorstep delivery'}
                    </p>
                  </div>
                </div>

                {user && (
                  <Link
                    href="/login?redirect=/checkout"
                    className="text-xs text-[#1B4332] hover:underline font-semibold"
                  >
                    Switch Account
                  </Link>
                )}
              </div>

              {/* If user is NOT logged in: Show Amazon Sign-In Card */}
              {!user && (
                <div className="p-6 bg-amber-50/40 space-y-5">
                  <div className="p-4 bg-white rounded-xl border border-amber-200 space-y-3">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-serif font-bold text-sm text-stone-900">
                          Sign In Required to Place Order
                        </h3>
                        <p className="text-xs text-stone-600 leading-relaxed mt-0.5">
                          Amazon requires user sign-in to safeguard verified customer identity, dispatch genuine AYUSH batch formulations, and store delivery map pins.
                        </p>
                      </div>
                    </div>

                    {loginError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    {/* Quick In-Line Login Form */}
                    <form onSubmit={handleInlineLogin} className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">Email or Mobile Number</label>
                          <input
                            type="text"
                            required
                            placeholder="Mobile number or email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded-lg outline-none focus:border-[#1B4332]"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Enter password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded-lg outline-none focus:border-[#1B4332]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={loginLoading}
                          className="bg-[#FFD814] hover:bg-[#F7CA00] text-stone-900 font-bold px-6 py-2.5 rounded-full text-xs transition-colors flex items-center justify-center gap-2 border border-[#FCD200]"
                        >
                          {loginLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span>Sign in & Continue to Address</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <div className="text-xs text-center sm:text-right">
                          <Link
                            href="/login?redirect=/checkout&mode=register"
                            className="text-[#1B4332] font-bold hover:underline"
                          >
                            New to Triven? Create account →
                          </Link>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* ================= STEP 2: DELIVERY ADDRESS & MAP PINNING ================= */}
            <div
              className={`bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all ${
                !user ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isAddressConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-[#1B4332] text-white'
                    }`}
                  >
                    {isAddressConfirmed ? '✓' : '2'}
                  </span>
                  <div>
                    <h2 className="font-serif font-bold text-base text-stone-900">
                      Step 2: Select a Delivery Address
                    </h2>
                    <p className="text-xs text-stone-500">
                      Confirm doorstep location & pinpoint exact house on Map
                    </p>
                  </div>
                </div>

                {isAddressConfirmed && user && (
                  <button
                    onClick={() => setIsAddressConfirmed(false)}
                    className="inline-flex items-center gap-1 text-xs text-[#1B4332] hover:underline font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {/* Locked Notice if not logged in */}
              {!user && (
                <div className="p-6 text-center text-xs text-stone-500 space-y-1">
                  <Lock className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                  <p className="font-medium text-stone-700">Address selection locked</p>
                  <p>Please sign in in Step 1 above to view saved addresses and open the map.</p>
                </div>
              )}

              {/* If Address is Confirmed: Show Amazon Confirmed Summary */}
              {user && isAddressConfirmed && (
                <div className="p-6 bg-emerald-50/30 space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">
                          {formData.fullName || user.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                          {formData.addressType === 'work' ? 'Office' : 'Home'}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Confirmed
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      {formData.addressLine1}
                      {formData.addressLine2 && `, ${formData.addressLine2}`}
                      {formData.landmark && ` (Landmark: ${formData.landmark})`},{' '}
                      {formData.city}, {formData.state} -{' '}
                      <strong className="text-stone-900 font-bold">{formData.pincode}</strong>
                    </p>

                    <p className="text-xs text-stone-500">Phone: {formData.phone}</p>

                    {/* GPS Pinned Location Pill */}
                    {mapLocation && (
                      <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-2 text-[11px] text-[#1B4332] font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37] fill-current" />
                        <span>
                          Doorstep GPS Pinned: {mapLocation.lat.toFixed(4)}° N,{' '}
                          {mapLocation.lng.toFixed(4)}° E
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* If Address NOT Confirmed: Show Saved Addresses or Add Address Form */}
              {user && !isAddressConfirmed && (
                <>
                  {user.addresses && user.addresses.length > 0 && !isAddingNewInCheckout ? (
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <h3 className="font-serif font-bold text-stone-900 text-sm">
                          Select a delivery address
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              fullName: user.name || '',
                              phone: user.phone || '',
                              addressLine1: '',
                              addressLine2: '',
                              landmark: '',
                              city: 'Haridwar',
                              state: 'Uttarakhand',
                              pincode: '249401',
                              addressType: 'home',
                            }));
                            setIsAddingNewInCheckout(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-[#1B4332] font-bold hover:underline cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add a new address</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {user.addresses.map((addr) => {
                          const isSelected =
                            selectedAddressId === addr._id ||
                            formData.addressLine1 === addr.addressLine1;
                          return (
                            <div
                              key={addr._id}
                              onClick={() => {
                                setSelectedAddressId(addr._id);
                                setFormData((prev) => ({
                                  ...prev,
                                  fullName: addr.fullName || user.name || prev.fullName,
                                  phone: addr.phone || user.phone || prev.phone,
                                  addressLine1: addr.addressLine1,
                                  addressLine2: addr.addressLine2 || '',
                                  city: addr.city || 'Haridwar',
                                  state: addr.state || 'Uttarakhand',
                                  pincode: addr.pincode || '249401',
                                  addressType: addr.type || 'home',
                                }));
                              }}
                              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[#1B4332] bg-emerald-50/40 ring-1 ring-[#1B4332]'
                                  : 'border-stone-200 hover:border-stone-300 bg-white'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="selectedSavedAddress"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="mt-0.5 text-[#1B4332] focus:ring-[#1B4332]"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-stone-900 text-sm">
                                      {addr.fullName || user.name}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                                      {addr.type || 'home'}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded text-[#1B4332]">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-stone-700 mt-1 leading-relaxed">
                                    {addr.addressLine1}
                                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city},{' '}
                                    {addr.state} -{' '}
                                    <strong className="font-bold">{addr.pincode}</strong>
                                  </p>
                                  <p className="text-stone-500 mt-1">Phone: {addr.phone}</p>

                                  {isSelected && (
                                    <div className="mt-3 pt-3 border-t border-emerald-100/60">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectAddress(addr);
                                        }}
                                        className="bg-[#FFD814] hover:bg-[#F7CA00] text-stone-900 font-bold px-6 py-2 rounded-full text-xs shadow-xs transition-colors border border-[#FCD200] cursor-pointer"
                                      >
                                        Deliver to this address
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              fullName: user.name || '',
                              phone: user.phone || '',
                              addressLine1: '',
                              addressLine2: '',
                              landmark: '',
                              city: 'Haridwar',
                              state: 'Uttarakhand',
                              pincode: '249401',
                              addressType: 'home',
                            }));
                            setIsAddingNewInCheckout(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-[#1B4332] font-semibold hover:underline cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add a new delivery address</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleConfirmAddress} className="p-6 space-y-5">
                      {user.addresses && user.addresses.length > 0 && (
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <h4 className="font-serif font-bold text-stone-900 text-sm">
                            Add a new delivery address
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsAddingNewInCheckout(false)}
                            className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                          >
                            Cancel / choose from saved addresses
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-stone-700 mb-1 font-bold">
                            Full Name (First and Last Name) *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="e.g. Ramesh Sharma"
                            className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#1B4332] outline-none"
                          />
                        </div>

                    <div>
                      <label className="block text-stone-700 mb-1 font-bold">
                        Mobile Number (10 digits) *
                      </label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="9876543210"
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#1B4332] outline-none"
                      />
                    </div>

                    {/* PIN CODE + INTERACTIVE MAP BUTTON */}
                    <div className="sm:col-span-2 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-stone-700 font-bold">
                          6-Digit PIN Code *
                        </label>

                        {/* Amazon Map Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setIsMapPickerOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors w-fit"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#1B4332] fill-current" />
                          <span>📍 Select / Pin Location on Map</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative max-w-xs w-full">
                          <input
                            type="text"
                            required
                            maxLength={6}
                            pattern="[0-9]{6}"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            onBlur={handlePincodeBlur}
                            placeholder="e.g. 249401"
                            className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#1B4332] outline-none"
                          />
                          {checkingPincode && (
                            <Loader2 className="w-4 h-4 text-stone-400 animate-spin absolute right-3 top-3" />
                          )}
                        </div>

                        <span className="text-[11px] text-stone-500">
                          {pincodeStatus ? (
                            <span className={pincodeStatus.serviceable ? 'text-emerald-700 font-bold' : 'text-red-600'}>
                              {pincodeStatus.message}
                            </span>
                          ) : (
                            'India SpeedPost & Express Delivery'
                          )}
                        </span>
                      </div>

                      {/* Map Confirmation Banner if pinned */}
                      {mapLocation && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-stone-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>
                              Exact Doorstep Pin Set: <strong>{mapLocation.locality}</strong> ({mapLocation.lat.toFixed(4)}° N, {mapLocation.lng.toFixed(4)}° E)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsMapPickerOpen(true)}
                            className="text-[11px] font-bold text-[#1B4332] underline"
                          >
                            Adjust Pin
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-stone-700 mb-1 font-bold">
                        Flat, House no., Building, Company, Apartment *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        placeholder="e.g. Flat 302, Shantikunj Towers, Ashram Road"
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#1B4332] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 mb-1 font-bold">
                        Area, Street, Sector, Village
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        placeholder="e.g. Near Har Ki Pauri / Motichur"
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#1B4332] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 mb-1 font-bold">
                        Landmark (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        placeholder="e.g. Opposite Shiv Temple / Metro Gate 2"
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#1B4332] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 mb-1 font-bold">Town / City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Haridwar"
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#1B4332] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 mb-1 font-bold">State *</label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:border-[#1B4332] outline-none"
                      >
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Kerala">Kerala</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Other">Other State</option>
                      </select>
                    </div>

                    {/* Address Type */}
                    <div className="sm:col-span-2 pt-1">
                      <label className="block text-stone-700 mb-2 font-bold">Address Type</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="addressType"
                            value="home"
                            checked={formData.addressType === 'home'}
                            onChange={() => setFormData({ ...formData, addressType: 'home' })}
                          />
                          <Home className="w-3.5 h-3.5 text-stone-500" />
                          <span>Home (7 AM – 9 PM delivery)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="addressType"
                            value="work"
                            checked={formData.addressType === 'work'}
                            onChange={() => setFormData({ ...formData, addressType: 'work' })}
                          />
                          <Building className="w-3.5 h-3.5 text-stone-500" />
                          <span>Office / Commercial (10 AM – 6 PM delivery)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="submit"
                      className="bg-[#FFD814] hover:bg-[#F7CA00] text-stone-900 font-bold px-7 py-2.5 rounded-full text-xs shadow-xs transition-colors border border-[#FCD200]"
                    >
                      Use this address & Proceed to Payment
                    </button>
                  </div>
                </form>
                  )}
                </>
              )}
            </div>

            {/* ================= STEP 3: PAYMENT METHOD ================= */}
            <div
              className={`bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all ${
                !user || !isAddressConfirmed ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <h2 className="font-serif font-bold text-base text-stone-900">
                    Step 3: Select Payment Method
                  </h2>
                  <p className="text-xs text-stone-500">
                    Choose Cash on Delivery or Instant Online Payment
                  </p>
                </div>
              </div>

              {(!user || !isAddressConfirmed) ? (
                <div className="p-6 text-center text-xs text-stone-500 space-y-1">
                  <Lock className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                  <p className="font-medium text-stone-700">Payment options locked</p>
                  <p>Confirm your delivery address in Step 2 above to unlock payment options.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* COD */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#1B4332] bg-emerald-50/50 shadow-xs'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                          <Banknote className="w-4 h-4 text-emerald-700" />
                          <span>Cash on Delivery (COD)</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Pay cash or scan UPI with delivery executive at doorstep.
                        </p>
                      </div>
                    </label>

                    {/* Online / Razorpay */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'border-[#1B4332] bg-emerald-50/50 shadow-xs ring-1 ring-[#1B4332]'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                          <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                          <span>Online / Paid (Direct Google Pay, PhonePe, Paytm & UPI)</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Directly opens Google Pay, PhonePe, Paytm app on mobile, or scan instant UPI QR code on PC.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-emerald-100/70">
                          <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-bold text-stone-700 shadow-2xs">
                            GPay
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-bold text-purple-700 shadow-2xs">
                            PhonePe
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-bold text-sky-600 shadow-2xs">
                            Paytm
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-bold text-emerald-800 shadow-2xs">
                            BHIM / Any UPI
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary & Item List (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <h2 className="font-serif font-bold text-base text-stone-900 pb-3 border-b border-stone-100 flex items-center justify-between">
                <span>Items in Order ({items.length})</span>
                <span className="text-xs text-stone-500 font-normal">Triven Prime Express</span>
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 text-xs">
                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 line-clamp-1">{item.name}</h4>
                      <p className="text-stone-400 text-[11px]">
                        Qty: {item.quantity} × ₹{item.sellingPrice}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-200 transition-colors"
                            aria-label={`Decrease quantity for ${item.name}`}
                          >
                            -
                          </button>
                          <span className="w-7 sm:w-8 text-center font-bold text-xs text-stone-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-200 transition-colors"
                            aria-label={`Increase quantity for ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            toggleWishlist({
                              _id: item.productId,
                              name: item.name,
                              slug: item.slug,
                              sellingPrice: item.sellingPrice,
                              mrp: item.mrp,
                              images: [item.image],
                            });
                            removeFromCart(item.productId);
                          }}
                          className="text-stone-500 hover:text-[#1B4332] py-1.5 px-2 text-[11px] font-medium transition-colors min-h-[32px] flex items-center"
                          title="Save for later in Wishlist"
                        >
                          Save for later
                        </button>
                        <span className="text-stone-300">|</span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-stone-500 hover:text-red-600 py-1.5 px-2 text-[11px] font-medium transition-colors min-h-[32px] flex items-center"
                          title="Delete item"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 shrink-0">
                      ₹{item.sellingPrice * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Amazon Delivery Guarantee Strip */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-stone-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#1B4332]">
                  <Truck className="w-4 h-4 text-[#1B4332]" />
                  <span>✓ Triven Prime Free 1-Day Delivery</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Guaranteed delivery by <strong>Tomorrow, 2:00 PM – 6:00 PM</strong>
                </p>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-stone-100">
                <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Add Gift Card or Promo Code</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Try code: VEDIC15"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 p-2 rounded-lg border border-stone-300 text-xs uppercase"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="bg-stone-900 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-stone-800"
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-emerald-700 font-bold">
                    ✓ Promo code "{appliedCoupon}" applied successfully!
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-600 font-medium">{couponError}</p>
                )}
              </form>

              {/* Server-Side Calculated Totals */}
              <div className="border-t border-stone-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Items Subtotal:</span>
                  <span>₹{serverCalculation ? serverCalculation.subtotal : '...'}</span>
                </div>

                {serverCalculation && serverCalculation.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Vedic Promotion Savings:</span>
                    <span>-₹{serverCalculation.discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Shipping & Handling:</span>
                  <span>
                    {serverCalculation && serverCalculation.shippingCharge === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE (Prime)</span>
                    ) : (
                      `₹${serverCalculation?.shippingCharge || 0}`
                    )}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-stone-900">
                    Order Total:
                  </span>
                  <div className="text-right">
                    <span className="font-serif text-2xl font-black text-[#1B4332]">
                      ₹{serverCalculation ? serverCalculation.totalAmount : '...'}
                    </span>
                    <span className="block text-[10px] text-stone-400">Inclusive of all AYUSH taxes</span>
                  </div>
                </div>
              </div>

              {/* Amazon Gold "Place Your Order" CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder || calculating || !user || !isAddressConfirmed}
                className={`w-full py-3.5 px-6 rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  !user || !isAddressConfirmed
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-[#FFD814] hover:bg-[#F7CA00] active:scale-98 text-stone-900 border border-[#FCD200]'
                }`}
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                    <span>Placing Your Order...</span>
                  </>
                ) : !user ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Place Order</span>
                  </>
                ) : !isAddressConfirmed ? (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Confirm Address in Step 2</span>
                  </>
                ) : (
                  <>
                    <span>Place Your Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-stone-500 flex items-center justify-center gap-2 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>100% Genuine Samhita Guarantee • Doorstep Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Map Picker Modal */}
      <AddressMapPicker
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialPincode={formData.pincode}
        initialCity={formData.city}
        onLocationSelect={handleLocationPicked}
      />

      <Footer />
    </div>
  );
}
