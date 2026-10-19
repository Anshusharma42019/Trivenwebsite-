'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
  UploadCloud,
  Image as ImageIcon,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { AYURVEDIC_DOSAGE_FORMS } from '@/lib/constants';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  // Image upload states
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const fileInputRef = useRef(null);

  // Form State
  const initialFormState = {
    name: '',
    sku: '',
    category: '',
    brand: '',
    mrp: '',
    sellingPrice: '',
    stock: '',
    lowStockThreshold: 10,
    dosageForm: 'Churna (Powder)',
    netQuantity: '100g',
    description: '',
    shortDescription: '',
    images: [],
    imagesText: '',
    ayushLicenseNumber: 'AYUSH-UK/L-442/2021',
    batchNumber: 'AYUR-2026-B1',
    ingredientsText: 'Ashwagandha (Withania somnifera) 100%',
    usageInstructions: 'Take 3-5g twice daily with warm milk or as directed by an Ayurvedic physician.',
    warnings: 'Store in a cool dry place away from direct sunlight.',
    isFeatured: false,
    isBestseller: false,
    status: 'published',
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        fetch(`/api/products?status=all&limit=50&search=${encodeURIComponent(search)}`),
        fetch('/api/categories'),
        fetch('/api/brands'),
      ]);

      const [prodJson, catJson, brandJson] = await Promise.all([
        prodRes.json(),
        catRes.json(),
        brandRes.json(),
      ]);

      if (prodRes.ok) setProducts(prodJson.data.products || []);
      if (catRes.ok) setCategories(catJson.data || []);
      if (brandRes.ok) setBrands(brandJson.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [search]);

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

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      category: categories[0]?._id || '',
      brand: brands[0]?._id || '',
      images: [],
      imagesText: '',
    });
    setUploadError(null);
    setShowUrlFallback(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    const prodImages = Array.isArray(p.images) ? p.images : [];
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category?._id || p.category || '',
      brand: p.brand?._id || p.brand || '',
      mrp: p.mrp,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold || 10,
      dosageForm: p.dosageForm || 'Churna (Powder)',
      netQuantity: p.netQuantity || '',
      description: p.description,
      shortDescription: p.shortDescription || '',
      images: prodImages,
      imagesText: prodImages.join('\n'),
      ayushLicenseNumber: p.ayushLicenseNumber || '',
      batchNumber: p.batchNumber || '',
      ingredientsText: (p.ingredients || []).map((i) => `${i.name} (${i.botanicalName || ''}) ${i.percentage || ''}`).join('\n'),
      usageInstructions: p.usageInstructions || '',
      warnings: p.warnings || '',
      isFeatured: !!p.isFeatured,
      isBestseller: !!p.isBestseller,
      status: p.status || 'published',
    });
    setUploadError(null);
    setShowUrlFallback(false);
    setModalOpen(true);
  };

  const handleFilesUpload = async (fileList, targetSlotIndex = null) => {
    const files = Array.from(fileList || []).filter((f) => f.type && f.type.startsWith('image/'));
    if (files.length === 0) return;

    setUploadingImages(true);
    setUploadError(null);

    try {
      const data = new FormData();
      files.forEach((f) => data.append('files', f));
      data.append('folder', 'products');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Image upload failed');
      }

      const newUrls = json.data?.urls || [];
      if (newUrls.length > 0) {
        setFormData((prev) => {
          let updated = [...prev.images];
          const slotToUse = targetSlotIndex !== null && targetSlotIndex !== undefined ? targetSlotIndex : selectedSlot;

          if (slotToUse !== null && slotToUse !== undefined) {
            if (slotToUse < updated.length) {
              updated[slotToUse] = newUrls[0];
              if (newUrls.length > 1) {
                updated.push(...newUrls.slice(1));
              }
            } else {
              updated.push(...newUrls);
            }
          } else {
            updated = [...updated, ...newUrls];
          }

          return {
            ...prev,
            images: updated,
            imagesText: updated.join('\n'),
          };
        });
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Failed to upload product images.');
    } finally {
      setUploadingImages(false);
      setSelectedSlot(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updated,
        imagesText: updated.join('\n'),
      };
    });
  };

  const handleSetPrimaryImage = (indexToPrimary) => {
    setFormData((prev) => {
      const target = prev.images[indexToPrimary];
      const others = prev.images.filter((_, idx) => idx !== indexToPrimary);
      const updated = [target, ...others];
      return {
        ...prev,
        images: updated,
        imagesText: updated.join('\n'),
      };
    });
  };

  const handleMoveImage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= formData.images.length) return;
    setFormData((prev) => {
      const updated = [...prev.images];
      const item = updated.splice(fromIdx, 1)[0];
      updated.splice(toIdx, 0, item);
      return {
        ...prev,
        images: updated,
        imagesText: updated.join('\n'),
      };
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionMsg(null);

    if (Number(formData.sellingPrice) > Number(formData.mrp)) {
      alert('Selling price cannot be greater than MRP.');
      setSaving(false);
      return;
    }

    try {
      const textImgs = (formData.imagesText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const combined = [...(Array.isArray(formData.images) ? formData.images : []), ...textImgs];
      const images = Array.from(new Set(combined.filter(Boolean)));



      const ingredients = formData.ingredientsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ name: line, botanicalName: '', percentage: '', benefits: '' }));

      const payload = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        brand: formData.brand || null,
        mrp: Number(formData.mrp),
        sellingPrice: Number(formData.sellingPrice),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        dosageForm: formData.dosageForm,
        netQuantity: formData.netQuantity,
        description: formData.description,
        shortDescription: formData.shortDescription,
        images: images,
        ayushLicenseNumber: formData.ayushLicenseNumber,
        batchNumber: formData.batchNumber,
        ingredients: ingredients.length > 0 ? ingredients : [{ name: 'Herb Extract' }],
        usageInstructions: formData.usageInstructions,
        warnings: formData.warnings,
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
        status: formData.status,
      };

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save product');
      }

      setModalOpen(false);
      setActionMsg(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
      setTimeout(() => setActionMsg(null), 3000);
      fetchCatalog();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (
      !confirm(
        `Are you sure you want to PERMANENTLY delete "${name}" from the database and website? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        setActionMsg(`Product "${name}" has been permanently deleted from website.`);
        setTimeout(() => setActionMsg(null), 3500);
        setProducts((prev) => prev.filter((p) => p._id !== id));
        fetchCatalog();
      } else {
        alert(json.error || 'Failed to delete product');
      }
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error deleting product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Product Catalog & Ayurvedic Medicines
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage formulations, pricing, AYUSH licensing, and inventory allocations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#18181B] hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Add New Formulation</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-amber-700" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search SKU, name, composition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="text-xs text-stone-500">
          Total in Database: <strong>{products.length}</strong>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Medicine & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price & MRP</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">AYUSH License</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#C5A059]" />
                    <span>Loading products...</span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0 flex items-center justify-center">
                          {p.images && p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-stone-400 font-mono text-[10px]">SKU: {p.sku}</span>
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-medium">
                              {p.images?.length || 0} {p.images?.length === 1 ? 'angle' : 'angles'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {p.category?.name || 'Ayurvedic Formulations'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      ₹{p.sellingPrice} <span className="text-stone-400 font-normal line-through text-[10px]">₹{p.mrp}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${p.stock <= p.lowStockThreshold ? 'text-red-600' : 'text-stone-900'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                      {p.ayushLicenseNumber || 'Compliant'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'published' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                          title="Edit Formulation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-8 space-y-6 my-auto border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                {editingProduct ? 'Edit Ayurvedic Formulation' : 'Create New Ayurvedic Formulation'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-stone-600 mb-1 font-semibold">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Organic Ashwagandha KSM-66 Churna"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">SKU (Unique) *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="TYR-ASH-001"
                    className="w-full p-2.5 rounded-xl border border-stone-300 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Brand / Manufacturer</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="">Direct Apothecary / Triven</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Low Stock Threshold</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Dosage Form</label>
                  <select
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    {AYURVEDIC_DOSAGE_FORMS.map((form) => (
                      <option key={form} value={form}>
                        {form}
                      </option>
                    ))}
                    {formData.dosageForm && !AYURVEDIC_DOSAGE_FORMS.includes(formData.dosageForm) && (
                      <option value={formData.dosageForm}>{formData.dosageForm}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Net Quantity</label>
                  <input
                    type="text"
                    value={formData.netQuantity}
                    onChange={(e) => setFormData({ ...formData, netQuantity: e.target.value })}
                    placeholder="100g or 200ml or 60 Tabs"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">AYUSH Manufacturing License</label>
                  <input
                    type="text"
                    value={formData.ayushLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, ayushLicenseNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Storefront Listing Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                  >
                    <option value="published">Published (Live on Website)</option>
                    <option value="draft">Draft (Hidden from Storefront)</option>
                    <option value="archived">Archived (De-listed)</option>
                  </select>
                </div>

                {/* Product Images Upload Section (Amazon 4-Angle Studio) */}
                <div className="sm:col-span-2 space-y-3 bg-stone-50/80 p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-stone-800 font-bold text-sm flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#8C5E3C]" />
                        <span>Triven Ayurveda Multi-Angle Studio ({formData.images.length} added)</span>
                      </label>
                      <p className="text-xs text-stone-500">
                        Upload different angles (Front, Back, Label, Seal) so customers can view all sides on Triven Ayurveda!
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSlot(null);
                          fileInputRef.current?.click();
                        }}
                        className="text-xs bg-[#18181B] text-[#C5A059] border border-[#C5A059]/40 hover:bg-stone-900 px-2.5 py-1 rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        + Upload Photos
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowUrlFallback(!showUrlFallback)}
                        className="text-xs text-stone-500 hover:text-stone-800 underline font-medium"
                      >
                        {showUrlFallback ? 'Hide URL' : 'Paste URL'}
                      </button>
                    </div>
                  </div>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFilesUpload(e.target.files, selectedSlot)}
                    className="hidden"
                  />

                  {/* Drag and Drop Zone if no images uploaded */}
                  {formData.images.length === 0 && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFilesUpload(e.dataTransfer.files, null);
                      }}
                      onClick={() => {
                        setSelectedSlot(null);
                        fileInputRef.current?.click();
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#C5A059] bg-amber-50/40'
                          : 'border-stone-300 hover:border-[#C5A059] bg-white hover:bg-stone-50/50'
                      }`}
                    >
                      {uploadingImages ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-2">
                          <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
                          <span className="text-sm font-semibold text-stone-700">Uploading photos to Cloudinary...</span>
                          <span className="text-xs text-stone-400">Saving securely in high resolution</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-[#8C5E3C] flex items-center justify-center border border-[#C5A059]/30 shadow-xs">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div className="text-sm font-semibold text-stone-700">
                            <span className="text-[#8C5E3C] underline decoration-[#C5A059] decoration-2">Click to select photos</span> or drag & drop all angles here
                          </div>
                          <div className="text-xs text-stone-400">
                            Select multiple images (Front, Back, Label, Cap) • PNG, JPG, WEBP up to 10MB
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {uploadError && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* 4 Standard Angle Slots + Extra Angles Grid */}
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Angle 1: Front / Hero', desc: 'Main product view' },
                        { label: 'Angle 2: Back View', desc: 'Back angle' },
                        { label: 'Angle 3: Ingredients', desc: 'Label close-up' },
                        { label: 'Angle 4: Cap & Seal', desc: 'Packaging / seal' },
                      ].map((slot, sIdx) => {
                        const imgUrl = formData.images[sIdx];
                        return (
                          <div
                            key={sIdx}
                            className={`relative rounded-xl border bg-white flex flex-col justify-between overflow-hidden transition-all aspect-square ${
                              imgUrl
                                ? sIdx === 0
                                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-xs'
                                  : 'border-stone-200 shadow-xs'
                                : 'border-2 border-dashed border-stone-300 hover:border-[#C5A059] bg-stone-50/60'
                            }`}
                          >
                            {imgUrl ? (
                              <>
                                <img
                                  src={imgUrl}
                                  alt={slot.label}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1.5 left-1.5 z-10">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
                                      sIdx === 0
                                        ? 'bg-[#18181B] text-[#C5A059]'
                                        : 'bg-stone-900/80 text-white'
                                    }`}
                                  >
                                    #{sIdx + 1} {sIdx === 0 ? 'Main Hero' : slot.label.split(':')[1]?.trim() || `Angle ${sIdx + 1}`}
                                  </span>
                                </div>
                                <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage(sIdx);
                                    }}
                                    title="Delete photo"
                                    className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow cursor-pointer hover:bg-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-stone-900/80 backdrop-blur-2xs text-white p-1 text-[10px] flex items-center justify-between z-10">
                                  {sIdx !== 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimaryImage(sIdx)}
                                      className="text-[#D4AF37] hover:underline font-bold cursor-pointer"
                                    >
                                      Set Hero
                                    </button>
                                  ) : (
                                    <span className="text-[#D4AF37] font-bold inline-flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      <span>Hero</span>
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={sIdx === 0}
                                      onClick={() => handleMoveImage(sIdx, sIdx - 1)}
                                      className="hover:text-amber-400 disabled:opacity-30 cursor-pointer"
                                      title="Move left"
                                    >
                                      ‹
                                    </button>
                                    <button
                                      type="button"
                                      disabled={sIdx === formData.images.length - 1}
                                      onClick={() => handleMoveImage(sIdx, sIdx + 1)}
                                      className="hover:text-amber-400 disabled:opacity-30 cursor-pointer"
                                      title="Move right"
                                    >
                                      ›
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSlot(sIdx);
                                  fileInputRef.current?.click();
                                }}
                                className="w-full h-full flex flex-col items-center justify-center p-2 text-center group cursor-pointer"
                              >
                                <div className="w-8 h-8 rounded-full bg-white border border-stone-200 group-hover:border-[#C5A059] flex items-center justify-center text-stone-500 group-hover:text-[#8C5E3C] mb-1 shadow-2xs">
                                  <Plus className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-stone-700 group-hover:text-stone-900 leading-tight">
                                  {slot.label}
                                </span>
                                <span className="text-[9px] text-stone-400 mt-0.5 leading-tight">
                                  Click to upload
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* Any extra images beyond 4 */}
                      {formData.images.slice(4).map((imgUrl, extraIdx) => {
                        const actualIdx = 4 + extraIdx;
                        return (
                          <div
                            key={actualIdx}
                            className="relative rounded-xl border border-stone-200 bg-white aspect-square overflow-hidden shadow-xs"
                          >
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute top-1.5 left-1.5 z-10">
                              <span className="bg-stone-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                #{actualIdx + 1} Extra Angle
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(actualIdx)}
                              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-stone-900/80 backdrop-blur-2xs text-white p-1 text-[10px] flex items-center justify-between z-10">
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(actualIdx)}
                                className="text-[#D4AF37] hover:underline font-bold cursor-pointer"
                              >
                                Set Hero
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(actualIdx, actualIdx - 1)}
                                  className="hover:text-amber-400 cursor-pointer"
                                >
                                  ‹
                                </button>
                                <button
                                  type="button"
                                  disabled={actualIdx === formData.images.length - 1}
                                  onClick={() => handleMoveImage(actualIdx, actualIdx + 1)}
                                  className="hover:text-amber-400 disabled:opacity-30 cursor-pointer"
                                >
                                  ›
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* + Add Another Angle Button if >= 4 */}
                      {formData.images.length >= 4 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSlot(null);
                            fileInputRef.current?.click();
                          }}
                          className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-[#C5A059] bg-stone-50/50 hover:bg-amber-50/40 transition-colors flex flex-col items-center justify-center p-2 text-center group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-white border border-stone-200 group-hover:border-[#C5A059] flex items-center justify-center text-[#8C5E3C] mb-1 shadow-2xs">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-bold text-stone-700 group-hover:text-stone-900">
                            Add More
                          </span>
                          <span className="text-[9px] text-stone-400">Extra angle</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Fallback URL textarea if needed */}
                  {showUrlFallback && (
                    <div className="pt-2 border-t border-stone-200">
                      <label className="block text-stone-500 mb-1 text-xs">
                        Manual Image URLs (one per line, optional)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.imagesText}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parsed = val.split('\n').map((s) => s.trim()).filter(Boolean);
                          setFormData({
                            ...formData,
                            imagesText: val,
                            images: parsed,
                          });
                        }}
                        placeholder="https://..."
                        className="w-full p-2 rounded-xl border border-stone-300 font-mono text-[11px]"
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-600 mb-1 font-semibold">Full Formulation Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-600 mb-1 font-semibold">Active Botanicals (Ingredients per line)</label>
                  <textarea
                    rows={2}
                    value={formData.ingredientsText}
                    onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="sm:col-span-2 flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span>Featured Rejuvenator</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.isBestseller}
                      onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    />
                    <span>Bestseller Formulation</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#18181B] hover:bg-stone-900 text-[#C5A059] border border-[#C5A059]/40 px-5 py-2 rounded-xl font-bold shadow-md flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
