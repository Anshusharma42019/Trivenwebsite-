'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Archive,
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

  const handleFilesUpload = async (fileList) => {
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
        throw new Error(json.message || 'Image upload failed');
      }

      const newUrls = json.data?.urls || [];
      if (newUrls.length > 0) {
        setFormData((prev) => {
          const updated = [...prev.images, ...newUrls];
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

    try {
      let images = Array.isArray(formData.images) ? [...formData.images] : [];
      if (images.length === 0 && formData.imagesText) {
        images = formData.imagesText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      }



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

  const handleArchive = async (id, name) => {
    if (!confirm(`Are you sure you want to archive "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setActionMsg(`Product "${name}" archived.`);
        fetchCatalog();
      }
    } catch (e) {
      console.error(e);
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
          className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Add New Formulation</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
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
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B4332]" />
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
                          <p className="text-stone-400 font-mono text-[10px]">SKU: {p.sku}</p>
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
                      <span className={`font-bold ${p.stock <= p.lowStockThreshold ? 'text-red-600' : 'text-emerald-800'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                      {p.ayushLicenseNumber || 'Compliant'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleArchive(p._id, p.name)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
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
                    <option value="Churna (Powder)">Churna (Powder)</option>
                    <option value="Vati/Gutika (Tablet)">Vati/Gutika (Tablet)</option>
                    <option value="Taila (Oil)">Taila (Oil)</option>
                    <option value="Avaleha (Paste)">Avaleha (Paste)</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Other">Other</option>
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

                {/* Product Images Upload Section */}
                <div className="sm:col-span-2 space-y-3 bg-stone-50/80 p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-stone-800 font-bold text-sm">
                        Product Images (Direct File Upload)
                      </label>
                      <p className="text-xs text-stone-500">
                        Upload real product photos from your computer or phone. First image is used as the Primary Amazon Hero.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUrlFallback(!showUrlFallback)}
                      className="text-xs text-[#1B4332] hover:underline font-medium"
                    >
                      {showUrlFallback ? 'Hide URL input' : 'Or paste URL'}
                    </button>
                  </div>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFilesUpload(e.target.files)}
                    className="hidden"
                  />

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFilesUpload(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#1B4332] bg-emerald-50/60'
                        : 'border-stone-300 hover:border-[#1B4332] bg-white hover:bg-stone-50/50'
                    }`}
                  >
                    {uploadingImages ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-2">
                        <Loader2 className="w-8 h-8 text-[#1B4332] animate-spin" />
                        <span className="text-sm font-semibold text-stone-700">Uploading image(s) to server...</span>
                        <span className="text-xs text-stone-400">Saving securely in high resolution</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center border border-emerald-100 shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-semibold text-stone-700">
                          <span className="text-[#1B4332] underline decoration-[#D4AF37] decoration-2">Click to select product photos</span> or drag & drop here
                        </div>
                        <div className="text-xs text-stone-400">
                          Supports PNG, JPG, WEBP, AVIF up to 10MB each • Select multiple files
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Uploaded Images Gallery Grid (Amazon Multiple Angle Photos) */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <div className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-stone-800">
                          <Camera className="w-4 h-4 text-[#1B4332]" />
                          <span>Product Angle Photos ({formData.images.length})</span>
                        </span>
                        <span className="text-[11px] text-stone-500">Angle #1 is used as Primary Amazon Hero view</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {formData.images.map((imgUrl, idx) => {
                          const angleName =
                            idx === 0
                              ? 'Main Hero (Front)'
                              : idx === 1
                              ? 'Back View'
                              : idx === 2
                              ? 'Ingredients / Label'
                              : idx === 3
                              ? 'Cap / Texture'
                              : `Angle ${idx + 1}`;

                          return (
                            <div
                              key={idx}
                              className={`relative rounded-xl overflow-hidden border bg-white shadow-xs flex flex-col justify-between ${
                                idx === 0
                                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40'
                                  : 'border-stone-200'
                              }`}
                            >
                              <div className="relative aspect-square bg-stone-100 overflow-hidden">
                                <img
                                  src={imgUrl}
                                  alt={`Product angle ${idx + 1}`}
                                  className="w-full h-full object-cover object-center"
                                />

                                {/* Angle Tag Badge */}
                                <div className="absolute top-1.5 left-1.5">
                                  {idx === 0 ? (
                                    <span className="bg-[#1B4332] text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-[#D4AF37]" />
                                      <span>#1 Main Hero</span>
                                    </span>
                                  ) : (
                                    <span className="bg-stone-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                                      #{idx + 1} {angleName}
                                    </span>
                                  )}
                                </div>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(idx);
                                  }}
                                  title="Delete this angle photo"
                                  className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-colors"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Card Actions Footer */}
                              <div className="p-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px]">
                                {idx !== 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryImage(idx)}
                                    className="text-[#1B4332] hover:underline font-bold"
                                  >
                                    Set as #1 Main
                                  </button>
                                ) : (
                                  <span className="text-[#B8860B] font-bold">★ Active Hero</span>
                                )}

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveImage(idx, idx - 1)}
                                    title="Move left"
                                    className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === formData.images.length - 1}
                                    onClick={() => handleMoveImage(idx, idx + 1)}
                                    title="Move right"
                                    className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Add More Angle Photo Card */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-[#1B4332] bg-stone-50/50 hover:bg-emerald-50/40 transition-colors flex flex-col items-center justify-center p-3 text-center group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-white border border-stone-200 group-hover:border-[#1B4332] flex items-center justify-center text-[#1B4332] mb-1.5 shadow-2xs">
                            <Plus className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-stone-700 group-hover:text-[#1B4332]">
                            Add Another Angle
                          </span>
                          <span className="text-[10px] text-stone-400 mt-0.5">Click to browse files</span>
                        </button>
                      </div>
                    </div>
                  )}

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
                  className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-5 py-2 rounded-xl font-bold shadow-md flex items-center gap-1.5"
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
