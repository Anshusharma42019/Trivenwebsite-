'use client';

import React, { useState, useEffect } from 'react';
import {
  TicketPercent,
  Plus,
  Check,
  X,
  Calendar,
  Loader2,
  Tag,
} from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minCartValue: 500,
    maxDiscountAmount: 300,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    perUserLimit: 1,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      const json = await res.json();
      if (res.ok) {
        setCoupons(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false);
      }
    };
    if (modalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase().trim(),
          discountValue: Number(formData.discountValue),
          minCartValue: Number(formData.minCartValue),
          maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
          perUserLimit: Number(formData.perUserLimit),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create coupon');

      setModalOpen(false);
      setMsg(`Coupon "${json.data.code}" launched successfully!`);
      setTimeout(() => setMsg(null), 3000);
      fetchCoupons();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Coupons & Promotional Offers
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure discount rules, threshold restrictions, and usage limits.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#18181B] hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md self-start"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-amber-700" />
          <span>{msg}</span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min Cart Value</th>
                <th className="py-3 px-4">Usage Count</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#C5A059]" />
                    <span>Loading coupons...</span>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No active coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{c.code}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `Flat ₹${c.discountValue} Off`}
                    </td>
                    <td className="py-3 px-4 text-stone-700">
                      ₹{c.minCartValue || 0}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : '(Unlimited)'}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.isActive ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE COUPON MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 my-auto border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Create Promotional Coupon
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MONSOON20"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Min Cart Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minCartValue}
                    onChange={(e) => setFormData({ ...formData, minCartValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Max Cap (₹, optional)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit || ''}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="e.g. 1000"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#18181B] hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/40 rounded-xl font-bold shadow-sm transition-all"
                >
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
