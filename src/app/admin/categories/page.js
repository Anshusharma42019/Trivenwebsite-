'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryModal, setCategoryModal] = useState(false);
  const [brandModal, setBrandModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '', image: '', sortOrder: 0 });
  const [newBrand, setNewBrand] = useState({ name: '', slug: '', description: '', licenseNo: '', address: '' });
  const [msg, setMsg] = useState(null);

  const fetchTaxonomy = async () => {
    setLoading(true);
    try {
      const [cRes, bRes] = await Promise.all([fetch('/api/categories'), fetch('/api/brands')]);
      const [cJson, bJson] = await Promise.all([cRes.json(), bRes.json()]);
      if (cRes.ok) setCategories(cJson.data || []);
      if (bRes.ok) setBrands(bJson.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (categoryModal) setCategoryModal(false);
        if (brandModal) setBrandModal(false);
      }
    };
    if (categoryModal || brandModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [categoryModal, brandModal]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCategoryModal(false);
      setNewCat({ name: '', slug: '', description: '', image: '', sortOrder: 0 });
      setMsg('Category added successfully.');
      setTimeout(() => setMsg(null), 3000);
      fetchTaxonomy();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBrand.name,
          slug: newBrand.slug,
          description: newBrand.description,
          manufacturerDetails: {
            licenseNo: newBrand.licenseNo,
            address: newBrand.address,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBrandModal(false);
      setNewBrand({ name: '', slug: '', description: '', licenseNo: '', address: '' });
      setMsg('Brand added successfully.');
      setTimeout(() => setMsg(null), 3000);
      fetchTaxonomy();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Categories & Brand Vaidyashalas
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure taxonomy classifications, nested disciplines, and AYUSH manufacturers.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCategoryModal(true)}
            className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => setBrandModal(true)}
            className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#1B4332]" />
            <span>Add Brand</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Grid: Categories and Brands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            Configured Categories ({categories.length})
          </h2>

          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c._id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-stone-900">{c.name}</h4>
                  <p className="text-[11px] text-stone-500 font-mono">slug: /{c.slug}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{c.description}</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            Authorized Brands & Vaidyashalas ({brands.length})
          </h2>

          <div className="space-y-3">
            {brands.map((b) => (
              <div key={b._id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-stone-900">{b.name}</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Licensed
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-mono">
                  License: {b.manufacturerDetails?.licenseNo || 'AYUSH Registered'}
                </p>
                <p className="text-[11px] text-stone-400">
                  {b.manufacturerDetails?.address || 'Haridwar, India'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE CATEGORY MODAL */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 my-auto border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">Add New Category</h3>
              <button
                type="button"
                onClick={() => setCategoryModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="e.g. Pure Herbs & Churnas"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Banner Image URL</label>
                <input
                  type="text"
                  value={newCat.image}
                  onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModal(false)}
                  className="px-4 py-2 border rounded-xl text-stone-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#1B4332] text-white rounded-xl font-bold">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BRAND MODAL */}
      {brandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 my-auto border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">Add Brand / Vaidyashala</h3>
              <button
                type="button"
                onClick={() => setBrandModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateBrand} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  placeholder="e.g. Kottakkal Arya Vaidya Sala"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">AYUSH Manufacturing License No.</label>
                <input
                  type="text"
                  value={newBrand.licenseNo}
                  onChange={(e) => setNewBrand({ ...newBrand, licenseNo: e.target.value })}
                  placeholder="e.g. AYUSH-UK/L-442/2021"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Manufacturing Address</label>
                <input
                  type="text"
                  value={newBrand.address}
                  onChange={(e) => setNewBrand({ ...newBrand, address: e.target.value })}
                  placeholder="e.g. Haridwar, Uttarakhand"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBrandModal(false)}
                  className="px-4 py-2 border rounded-xl text-stone-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#1B4332] text-white rounded-xl font-bold">
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
