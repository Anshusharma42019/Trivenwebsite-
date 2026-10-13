'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  MapPin,
  User,
  LogOut,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Truck,
  RotateCcw,
  Heart,
  Plus,
  Trash2,
  Home,
  Building,
  Navigation,
} from 'lucide-react';
import AddressMapPicker from '@/components/store/AddressMapPicker';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'buy_again' | 'not_shipped' | 'addresses'

  // Address state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);

  const handleLocationPicked = (loc) => {
    setMapLocation(loc);
    setNewAddressForm((prev) => ({
      ...prev,
      pincode: loc.pincode || prev.pincode,
      city: loc.city || prev.city,
      state: loc.state || prev.state,
      addressLine2: loc.locality || prev.addressLine2,
      addressLine1: prev.addressLine1 ? prev.addressLine1 : (loc.locality || ''),
    }));
  };

  const [newAddressForm, setNewAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home',
    isDefault: false,
  });

  const handlePincodeChange = async (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setNewAddressForm((prev) => ({ ...prev, pincode: cleaned }));
    if (cleaned.length === 6) {
      try {
        const res = await fetch(`/api/pincodes/check?pincode=${cleaned}`);
        const data = await res.json();
        if (res.ok && data.data?.serviceable) {
          setNewAddressForm((prev) => ({
            ...prev,
            pincode: cleaned,
            city: data.data.city && data.data.city !== 'India' ? data.data.city : prev.city,
            state: data.data.state || prev.state,
          }));
        }
      } catch (err) {}
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressError(null);
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAddressForm,
          fullName: newAddressForm.fullName || user.name,
          phone: newAddressForm.phone || user.phone || '9876543210',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save address');
      }

      if (newAddressForm.isDefault || !user.addresses || user.addresses.length === 0) {
        try {
          if (newAddressForm.pincode) localStorage.setItem('triven_pincode', newAddressForm.pincode);
          if (newAddressForm.city) localStorage.setItem('triven_city', newAddressForm.city);
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
      }

      await refreshUser();
      setIsAddingAddress(false);
      setNewAddressForm({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        type: 'home',
        isDefault: false,
      });
    } catch (err) {
      setAddressError(err.message);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId, isDefault: true }),
      });
      if (res.ok) {
        const target = user.addresses?.find((a) => a._id === addressId);
        if (target) {
          try {
            if (target.pincode) localStorage.setItem('triven_pincode', target.pincode);
            if (target.city) localStorage.setItem('triven_city', target.city);
            window.dispatchEvent(new Event('storage'));
          } catch (e) {}
        }
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      const res = await fetch(`/api/user/addresses?id=${addressId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    document.title = 'Your Account Hub | Triven Ayurveda';
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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4332]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Amazon Account Header */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2">
            <Link href="/" className="hover:text-[#1B4332] hover:underline">
              Home
            </Link>
            <span>›</span>
            <span className="text-stone-800 font-semibold">Your Account</span>
          </div>

          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Your Account
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Hello, <strong className="text-stone-800">{user.name}</strong> • {user.email}
          </p>
        </div>

        {/* AMAZON 6-TILE ACCOUNT HUB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          
          {/* Tile 1: Your Orders */}
          <Link
            href="/orders"
            className="p-5 rounded-xl border border-stone-200 bg-white hover:border-[#1B4332] hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base group-hover:text-[#1B4332] transition-colors">Your Orders</h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Track, return, or buy classical medicines again
              </p>
            </div>
          </Link>

          {/* Tile 2: Your Wish List */}
          <Link
            href="/wishlist"
            className="p-5 rounded-xl border border-stone-200 bg-white hover:border-red-400 hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base group-hover:text-red-700 transition-colors">Your Wish List</h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                View saved herbal formulations & move to cart
              </p>
            </div>
          </Link>

          {/* Tile 3: Prime Membership */}
          <div className="p-5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base">Vedic Prime Club</h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Manage benefits and 1-Day free delivery
              </p>
            </div>
          </div>

          {/* Tile 4: Your Addresses */}
          <button
            onClick={() => setActiveTab('addresses')}
            className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 cursor-pointer group ${
              activeTab === 'addresses'
                ? 'border-[#1B4332] bg-emerald-50/50 shadow-sm'
                : 'border-stone-200 bg-white hover:border-[#1B4332] hover:shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base group-hover:text-[#1B4332] transition-colors">Your Addresses</h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {user.addresses?.length || 0} saved delivery {user.addresses?.length === 1 ? 'address' : 'addresses'}
              </p>
            </div>
          </button>

          {/* Tile 5: Payment Options */}
          <div className="p-5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B4332] flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base">Payment Options</h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Manage UPI, card details & COD preferences
              </p>
            </div>
          </div>

          {/* Tile 6: Help & Consultations */}
          <div className="p-5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B4332] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base">Vaidya Consultations</h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Clinical prescription history & dosage plans
              </p>
            </div>
          </div>

        </div>

        {/* AMAZON ORDER & ADDRESS HUB SECTION */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-stone-200 pb-3 mb-6 text-sm overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('orders')}
              className={`font-serif font-bold pb-3 -mb-3 border-b-2 transition-colors shrink-0 ${
                activeTab === 'orders'
                  ? 'border-[#1B4332] text-[#1B4332]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('buy_again')}
              className={`font-serif font-bold pb-3 -mb-3 border-b-2 transition-colors shrink-0 ${
                activeTab === 'buy_again'
                  ? 'border-[#1B4332] text-[#1B4332]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Buy Again
            </button>
            <button
              onClick={() => setActiveTab('not_shipped')}
              className={`font-serif font-bold pb-3 -mb-3 border-b-2 transition-colors shrink-0 ${
                activeTab === 'not_shipped'
                  ? 'border-[#1B4332] text-[#1B4332]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Not Yet Shipped
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`font-serif font-bold pb-3 -mb-3 border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === 'addresses'
                  ? 'border-[#1B4332] text-[#1B4332]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>Your Addresses ({user.addresses?.length || 0})</span>
            </button>
          </div>

          {activeTab === 'addresses' ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-lg">Your Delivery Addresses</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage saved delivery addresses for 1-click Amazon-style checkout
                  </p>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => {
                      setNewAddressForm({
                        fullName: user.name || '',
                        phone: user.phone || '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        pincode: '',
                        type: 'home',
                        isDefault: (user.addresses || []).length === 0,
                      });
                      setIsAddingAddress(true);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Add Address Form Modal / Box */}
              {isAddingAddress && (
                <div className="bg-stone-50 rounded-xl p-5 sm:p-6 border-2 border-dashed border-[#1B4332]/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1B4332]" />
                      Add a new delivery address
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {addressError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                      {addressError}
                    </div>
                  )}

                  {/* Interactive Map Selector Option */}
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-amber-50/40 p-3.5 sm:p-4 rounded-xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-xs">
                        <MapPin className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <span>Choose Location on Map</span>
                          <span className="text-[10px] bg-emerald-100 text-[#1B4332] font-sans font-bold px-1.5 py-0.2 rounded">Fast Auto-fill</span>
                        </h5>
                        <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                          Search any Indian PIN code or Area / Locality to auto-fill address details with 100% accuracy
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 bg-[#1B4332] hover:bg-[#163628] text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors shadow-xs cursor-pointer shrink-0"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>📍 Select on Map</span>
                    </button>
                  </div>

                  {/* Map Confirmation Banner if pinned */}
                  {mapLocation && (
                    <div className="p-3 bg-emerald-100/70 rounded-xl border border-emerald-400 text-xs text-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          Doorstep GPS Pinned: <strong>{mapLocation.locality}</strong>, {mapLocation.city} ({mapLocation.lat.toFixed(4)}° N, {mapLocation.lng.toFixed(4)}° E)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMapPickerOpen(true)}
                        className="text-[11px] font-bold text-[#1B4332] underline hover:text-[#163628] cursor-pointer"
                      >
                        Adjust Pin
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddressForm.fullName}
                          onChange={(e) =>
                            setNewAddressForm({ ...newAddressForm, fullName: e.target.value })
                          }
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#1B4332] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Phone Number (10 digits) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={newAddressForm.phone}
                          onChange={(e) =>
                            setNewAddressForm({ ...newAddressForm, phone: e.target.value })
                          }
                          placeholder="e.g. 9876543210"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#1B4332] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Flat, House no., Building, Company, Apartment *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.addressLine1}
                        onChange={(e) =>
                          setNewAddressForm({ ...newAddressForm, addressLine1: e.target.value })
                        }
                        placeholder="House / Flat No., Road / Street"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#1B4332] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Area, Street, Sector, Village (Optional)
                      </label>
                      <input
                        type="text"
                        value={newAddressForm.addressLine2}
                        onChange={(e) =>
                          setNewAddressForm({ ...newAddressForm, addressLine2: e.target.value })
                        }
                        placeholder="Colony, Landmark, Sector"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#1B4332] bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Town/City *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddressForm.city}
                          onChange={(e) =>
                            setNewAddressForm({ ...newAddressForm, city: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#1B4332] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddressForm.state}
                          onChange={(e) =>
                            setNewAddressForm({ ...newAddressForm, state: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#1B4332] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          6 digits PIN code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={newAddressForm.pincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          placeholder="e.g. 226021"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#1B4332] bg-white"
                        />
                      </div>
                    </div>

                    {/* Address Type & Default */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="font-semibold text-stone-700">Type:</span>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="addressType"
                            checked={newAddressForm.type === 'home'}
                            onChange={() =>
                              setNewAddressForm({ ...newAddressForm, type: 'home' })
                            }
                            className="text-[#1B4332] focus:ring-[#1B4332]"
                          />
                          <span>Home (7am-9pm)</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="addressType"
                            checked={newAddressForm.type === 'work'}
                            onChange={() =>
                              setNewAddressForm({ ...newAddressForm, type: 'work' })
                            }
                            className="text-[#1B4332] focus:ring-[#1B4332]"
                          />
                          <span>Work (10am-6pm)</span>
                        </label>
                      </div>

                      <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAddressForm.isDefault}
                          onChange={(e) =>
                            setNewAddressForm({ ...newAddressForm, isDefault: e.target.checked })
                          }
                          className="rounded text-[#1B4332] focus:ring-[#1B4332]"
                        />
                        <span className="font-medium text-stone-700">
                          Make this my default address
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={addressLoading}
                        className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold px-5 py-2.5 rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {addressLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Save Address</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses List */}
              {(!user.addresses || user.addresses.length === 0) ? (
                <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center text-xl mx-auto mb-3">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-stone-800 text-base">
                    No saved addresses found
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Add your delivery address to enjoy 1-click checkout and Vedic fast delivery.
                  </p>
                  {!isAddingAddress && (
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="inline-flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold px-5 py-2.5 rounded-lg text-xs shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Address Manually</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingAddress(true);
                          setIsMapPickerOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 bg-[#1B4332] hover:bg-[#163628] text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow-xs cursor-pointer"
                      >
                        <Navigation className="w-4 h-4 text-[#D4AF37]" />
                        <span>📍 Choose Location on Map</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Card to add new address */}
                  <button
                    onClick={() => {
                      setNewAddressForm({
                        fullName: user.name || '',
                        phone: user.phone || '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        pincode: '',
                        type: 'home',
                        isDefault: false,
                      });
                      setIsAddingAddress(true);
                    }}
                    className="border-2 border-dashed border-stone-300 hover:border-[#1B4332] rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-stone-500 hover:text-[#1B4332] transition-colors min-h-[200px] cursor-pointer group bg-stone-50/30"
                  >
                    <div className="w-10 h-10 rounded-full border border-stone-300 group-hover:border-[#1B4332] flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-serif font-bold text-sm">Add Address</span>
                  </button>

                  {/* Render existing addresses */}
                  {user.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`relative rounded-xl border p-5 flex flex-col justify-between transition-all ${
                        addr.isDefault
                          ? 'border-[#1B4332] bg-white ring-2 ring-[#1B4332]/10 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                              {addr.type || 'home'}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#1B4332]">
                                Default
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="font-serif font-bold text-stone-900 text-sm">
                          {addr.fullName || user.name}
                        </h4>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {addr.addressLine1}
                          {addr.addressLine2 && `, ${addr.addressLine2}`}
                        </p>
                        <p className="text-xs text-stone-600 font-medium">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-stone-500 mt-2">
                          Phone: <span className="font-semibold text-stone-800">{addr.phone}</span>
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => handleSetDefaultAddress(addr._id)}
                            className="text-[#1B4332] hover:underline font-semibold cursor-pointer"
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span className="text-stone-400 font-medium text-[11px]">Primary Address</span>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-stone-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : loadingOrders ? (
            <div className="py-12 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1B4332]" />
              <span>Loading your order history...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-2xl mx-auto mb-3 font-serif">
                📦
              </div>
              <h3 className="font-serif font-bold text-stone-800 text-base">
                You have not placed any orders yet
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Explore authentic classical formulations crafted according to Charaka Samhita.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold px-6 py-2.5 rounded-lg text-xs shadow-xs"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={order._id}
                    className="rounded-xl border border-stone-200 overflow-hidden shadow-2xs bg-white"
                  >
                    {/* Amazon Order Card Header */}
                    <div className="bg-stone-50 px-4 sm:px-6 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
                      <div className="flex items-center gap-6 sm:gap-10">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-stone-400">ORDER PLACED</span>
                          <span className="font-medium text-stone-800">{orderDate}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-stone-400">TOTAL</span>
                          <span className="font-bold text-stone-900">₹{order.totalAmount}</span>
                        </div>
                        <div className="hidden sm:block">
                          <span className="block text-[10px] uppercase font-bold text-stone-400">SHIP TO</span>
                          <span className="font-medium text-stone-800">{order.shippingAddress?.fullName || user.name}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-stone-400">ORDER #</span>
                        <span className="font-mono font-medium text-stone-900">{order.orderNumber}</span>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                            <Truck className="w-3.5 h-3.5" />
                            <span>{order.status === 'delivered' ? 'Delivered' : 'Dispatched / In Transit'}</span>
                          </span>
                          <span className="text-xs text-stone-500">
                            Payment: <strong className="uppercase">{order.paymentMethod}</strong>
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-lg bg-stone-50 border border-stone-200 overflow-hidden shrink-0">
                                <img
                                  src={
                                    item.product?.images && item.product?.images[0]
                                      ? item.product.images[0]
                                      : 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=200'
                                  }
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-xs">
                                <p className="font-bold text-stone-900 line-clamp-1">{item.name}</p>
                                <p className="text-stone-500">
                                  Qty: {item.quantity} • ₹{item.price} each
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Amazon Order Action Buttons */}
                      <div className="flex flex-col gap-2 shrink-0 sm:w-44">
                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="w-full text-center bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold py-2 px-3 rounded-lg text-xs shadow-xs transition-colors"
                        >
                          Track Package
                        </Link>
                        <Link
                          href="/products"
                          className="w-full text-center bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold py-2 px-3 rounded-lg text-xs border border-stone-300 transition-colors"
                        >
                          Buy it again
                        </Link>
                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="w-full text-center text-xs text-stone-600 hover:text-[#1B4332] hover:underline py-1"
                        >
                          View invoice & details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="mt-8 text-center sm:text-right">
          <button
            onClick={logout}
            className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1.5 hover:underline"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out of your Triven account</span>
          </button>
        </div>

        {/* Leaflet Interactive Map Picker Modal */}
        <AddressMapPicker
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          initialPincode={newAddressForm.pincode}
          initialCity={newAddressForm.city}
          onLocationSelect={handleLocationPicked}
        />
      </main>

      <Footer />
    </div>
  );
}
