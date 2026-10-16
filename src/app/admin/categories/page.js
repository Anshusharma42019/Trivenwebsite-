'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  ShieldCheck,
  UploadCloud,
  ImageIcon,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryModal, setCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [brandModal, setBrandModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', image: '', sortOrder: 0 });
  const [newBrand, setNewBrand] = useState({ name: '', slug: '', description: '', licenseNo: '', address: '' });
  const [msg, setMsg] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatForm({ name: '', slug: '', description: '', image: '', sortOrder: 0 });
    setCategoryModal(true);
  };

  const handleOpenEditCategory = (c) => {
    setEditingCategory(c);
    setCatForm({
      name: c.name || '',
      slug: c.slug || '',
      description: c.description || '',
      image: c.image || '',
      sortOrder: c.sortOrder || 0,
    });
    setCategoryModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'categories');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      const uploadedUrl = data.data?.url || (data.data?.urls && data.data.urls[0]);
      if (uploadedUrl) {
        setCatForm((prev) => ({ ...prev, image: uploadedUrl }));
      }
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setCategoryModal(false);
      setEditingCategory(null);
      setCatForm({ name: '', slug: '', description: '', image: '', sortOrder: 0 });
      setMsg(editingCategory ? 'Category updated successfully.' : 'Category added successfully.');
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
            Configure taxonomy classifications, upload category images, and manage AYUSH manufacturers.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleOpenAddCategory}
            className="bg-[#18181B] hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => setBrandModal(true)}
            className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#8C5E3C]" />
            <span>Add Brand</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-amber-700" />
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
              <div
                key={c._id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl border border-stone-200 bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-stone-900 truncate">{c.name}</h4>
                    <p className="text-[11px] text-stone-500 font-mono">slug: /{c.slug}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{c.description || 'No description'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditCategory(c)}
                    className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-200 text-stone-700 transition-colors"
                    title="Edit category & upload image"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                    Licensed
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-mono">
                  License: {b.manufacturerDetails?.licenseNo || 'AYUSH Registered'}
                </p>
                <p className="text-[11px] text-stone-400">
                  {b.manufacturerDetails?.address || 'New Delhi, India'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 my-auto border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Pure Herbs & Churnas"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              {/* Category Image Upload */}
              <div className="space-y-2">
                <label className="block text-stone-600 font-semibold">Category Image (Uploaded by Admin)</label>
                
                {catForm.image && (
                  <div className="relative w-24 h-24 rounded-xl border border-stone-200 overflow-hidden bg-stone-50 mb-2">
                    <img src={catForm.image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCatForm({ ...catForm, image: '' })}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#18181B] text-[#C5A059] border border-[#C5A059]/40 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-900 disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Upload Photo from Device</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="text"
                  value={catForm.image}
                  onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                  placeholder="Or paste image URL"
                  className="w-full p-2 rounded-xl border border-stone-200 text-xs font-mono mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCategoryModal(false)}
                  className="px-4 py-2 border rounded-xl text-stone-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#18181B] hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/40 rounded-xl font-bold">
                  {editingCategory ? 'Update Category' : 'Save Category'}
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
              <h3 className="font-serif font-bold text-base text-stone-900">Add Licensed Brand</h3>
              <button
                type="button"
                onClick={() => setBrandModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBrand} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Brand / Vaidyashala Name *</label>
                <input
                  type="text"
                  required
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Manufacturing License Number *</label>
                <input
                  type="text"
                  required
                  value={newBrand.licenseNo}
                  onChange={(e) => setNewBrand({ ...newBrand, licenseNo: e.target.value })}
                  placeholder="e.g. AYUSH-UK-2024-884"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Factory / Pharmacy Address</label>
                <input
                  type="text"
                  value={newBrand.address}
                  onChange={(e) => setNewBrand({ ...newBrand, address: e.target.value })}
                  placeholder="New Delhi, Delhi"
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
                <button type="submit" className="px-5 py-2 bg-[#18181B] hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/40 rounded-xl font-bold">
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
