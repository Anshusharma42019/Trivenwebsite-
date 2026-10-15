'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Check,
  Save,
  Loader2,
  Building2,
  Truck,
  CreditCard,
  Megaphone,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const json = await res.json();
        if (res.ok) setSettings(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save settings');

      setMsg('Store configuration successfully saved and audited!');
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-24 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#C5A059]" />
        <span>Loading store settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Store Configuration & Commerce Settings
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Authoritative settings for shipping thresholds, Cash on Delivery, and storefront branding.
        </p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-stone-900 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-[#8C5E3C]" />
          <span>{msg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Brand & Contact */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
            Brand Identity & Support Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Store Legal Name</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Brand Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Patient Support Email</label>
              <input
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Support Helpline Phone</label>
              <input
                type="text"
                required
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-600 mb-1 font-semibold">Registered Apothecary Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Shipping & COD */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            Shipping Rates & Cash on Delivery
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Free Delivery Cart Threshold (₹)</label>
              <input
                type="number"
                min={0}
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
              <p className="text-[11px] text-stone-400 mt-1">Orders above this amount receive 100% free delivery.</p>
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Standard Shipping Charge (₹)</label>
              <input
                type="number"
                min={0}
                value={settings.defaultShippingFee}
                onChange={(e) => setSettings({ ...settings, defaultShippingFee: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="cod-toggle"
                checked={settings.codEnabled}
                onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="cod-toggle" className="font-semibold text-stone-800 cursor-pointer">
                Enable Cash on Delivery (COD) for Indian PIN Codes
              </label>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
            <Megaphone className="w-4 h-4 text-[#D4AF37]" />
            Storefront Announcement Bar
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ann-toggle"
                checked={settings.announcementBar?.enabled ?? true}
                onChange={(e) => setSettings({
                  ...settings,
                  announcementBar: { ...settings.announcementBar, enabled: e.target.checked },
                })}
                className="w-4 h-4"
              />
              <label htmlFor="ann-toggle" className="font-semibold text-stone-800 cursor-pointer">
                Display top banner on customer storefront
              </label>
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Banner Message</label>
              <input
                type="text"
                value={settings.announcementBar?.text || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  announcementBar: { ...settings.announcementBar, text: e.target.value },
                })}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto justify-center min-h-[44px] bg-[#18181B] hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/40 px-6 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all hover:scale-102 active:scale-98"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" /> : <Save className="w-4 h-4 text-[#C5A059]" />}
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
