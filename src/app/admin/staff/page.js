'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  ShieldCheck,
  Check,
  X,
  Loader2,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { ROLES, ROLE_PERMISSIONS } from '@/lib/permissions';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'product_manager',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [modalError, setModalError] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/staff');
      const json = await res.json();
      if (res.ok) {
        setStaff(json.data || []);
      } else {
        setErrorMsg(json.error || 'Failed to fetch staff members. Please verify you are logged in as Super Admin.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || 'Network error fetching staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
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

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to onboard staff');

      setModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'product_manager' });
      setMsg(`Staff member ${json.data.name} created successfully.`);
      setTimeout(() => setMsg(null), 4000);
      fetchStaff();
    } catch (err) {
      setModalError(err.message);
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
            Staff Members & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage administrative staff, permissions, and internal module authorizations.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#18181B] hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm self-start transition-colors"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Onboard Staff Member</span>
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-stone-900 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-[#8C5E3C]" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => fetchStaff()}
            className="text-[11px] underline font-bold text-amber-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role & Hierarchy</th>
                <th className="py-3 px-4">Access Scope</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#C5A059]" />
                    <span>Loading staff directory...</span>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    No staff members found.
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#18181B] text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center font-bold text-[11px]">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {s.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-800 font-mono">
                        {s.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-500 text-[11px]">
                      {s.role === 'super_admin' ? (
                        <span className="text-[#8C5E3C] font-bold inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                          <span>Full Master Privileges</span>
                        </span>
                      ) : (
                        <span>Standard Role Permissions</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100/70 text-amber-900 border border-amber-200/60">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 my-auto border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Onboard Staff Account
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vaidya Ramesh"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ramesh@trivenayurveda.com"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Temporary Password (min 8 chars) *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Administrative Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="admin">Admin (General Administrator)</option>
                  <option value="product_manager">Product Manager (Catalog & Ingredients)</option>
                  <option value="inventory_manager">Inventory Manager (Stock & Batches)</option>
                  <option value="order_manager">Order Manager (Fulfillment & Tracking)</option>
                  <option value="customer_support">Customer Support (CRM & Queries)</option>
                  <option value="marketing_manager">Marketing Manager (Coupons & Banners)</option>
                  <option value="accountant">Accountant / Finance Viewer</option>
                </select>
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
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
