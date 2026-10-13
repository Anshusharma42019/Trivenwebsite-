'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Eye,
  Sliders,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';



export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    subtitle: '',
    badge: 'Authentic Ayurveda',
    imageUrl: PRESET_BANNER_IMAGES[0].url,
    linkUrl: '/products',
    ctaText: 'Explore Remedy',
    sortOrder: 0,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef(null);

  const handleBannerFileUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    setUploadingImage(true);
    setUploadError(null);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'banners');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Banner image upload failed');
      }

      const uploadedUrl = json.data?.url || json.data?.urls?.[0];
      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: uploadedUrl,
        }));
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Failed to upload banner image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners?admin=true');
      const json = await res.json();
      if (res.ok) {
        setBanners(json.data || []);
        if (json.data && json.data.length > 0 && !previewBanner) {
          setPreviewBanner(json.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load banners', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
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

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData(initialForm);
    setUploadError(null);
    setShowUrlFallback(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setFormData({
      title: b.title || '',
      subtitle: b.subtitle || '',
      badge: b.badge || 'Authentic Ayurveda',
      imageUrl: b.imageUrl || '',
      linkUrl: b.linkUrl || '/products',
      ctaText: b.ctaText || 'Explore Remedy',
      sortOrder: b.sortOrder !== undefined ? b.sortOrder : 0,
      isActive: b.isActive !== undefined ? b.isActive : true,
    });
    setUploadError(null);
    setShowUrlFallback(false);
    setModalOpen(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const url = editingBanner ? `/api/banners/${editingBanner._id}` : '/api/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save banner');
      }

      setStatusMsg(`Banner "${formData.title}" saved successfully.`);
      setModalOpen(false);
      fetchBanners();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      const res = await fetch(`/api/banners/${banner._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b))
        );
      }
    } catch (e) {
      console.error('Failed to toggle banner status', e);
    }
  };

  const handleDeleteBanner = async (id, title) => {
    if (!confirm(`Are you sure you want to delete banner "${title}"?`)) return;

    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg(`Banner deleted successfully.`);
        setBanners((prev) => prev.filter((b) => b._id !== id));
        if (previewBanner?._id === id) {
          setPreviewBanner(null);
        }
      }
    } catch (e) {
      console.error('Failed to delete banner', e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-[#1B4332]" />
            <span>Hero & Marketing Banners</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Curate the storefront homepage carousel, festival campaigns, and classical remedy showcases.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Add New Hero Banner</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Storefront Preview Simulator */}
      {previewBanner && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs space-y-2">
          <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-700 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#1B4332]" />
              <span>Live Storefront Simulation: "{previewBanner.title}"</span>
            </span>
            <span className="text-stone-400 text-[11px]">Desktop & Mobile Preview</span>
          </div>

          <div className="relative h-64 sm:h-72 overflow-hidden bg-stone-900">
            <img
              src={previewBanner.imageUrl}
              alt=""
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/60 to-transparent flex items-center px-6 sm:px-12">
              <div className="max-w-xl space-y-2 text-white">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#1B4332]">
                  {previewBanner.badge || 'Authentic Ayurveda'}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                  {previewBanner.title}
                </h3>
                {previewBanner.subtitle && (
                  <p className="text-xs sm:text-sm text-stone-200 line-clamp-2">
                    {previewBanner.subtitle}
                  </p>
                )}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#FFD814] text-stone-900 font-bold px-4 py-2 rounded-full text-xs shadow-md">
                    <span>{previewBanner.ctaText || 'Explore Remedy'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banners Grid List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-serif font-bold text-base text-stone-900">
            Active Storefront Banners ({banners.length})
          </h2>
          <span className="text-xs text-stone-500">Sorted by Display Priority</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B4332] mx-auto mb-2" />
            <p className="text-xs text-stone-500">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 space-y-3">
            <p>No promotional banners found. Create your first hero campaign banner.</p>
            <button
              onClick={handleOpenAdd}
              className="bg-[#1B4332] text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              Add First Banner
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {banners.map((b) => (
              <div
                key={b._id}
                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
              >
                {/* Thumbnail & Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    onClick={() => setPreviewBanner(b)}
                    className="w-24 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 cursor-pointer group relative"
                    title="Click to preview"
                  >
                    <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px]">
                      Preview
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-stone-900 truncate">{b.title}</h4>
                      <span className="text-[10px] bg-stone-100 font-mono px-1.5 py-0.5 rounded text-stone-600">
                        Order #{b.sortOrder}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 truncate">{b.subtitle || 'No subtitle'}</p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-0.5">
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium">
                        {b.badge}
                      </span>
                      <span>Link: <code className="text-stone-700">{b.linkUrl}</code></span>
                      <span>CTA: <strong className="text-stone-700">{b.ctaText}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  {/* Status Toggle */}
                  <button
                    onClick={() => handleToggleStatus(b)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      b.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    {b.isActive ? '✓ Active' : 'Inactive'}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 text-stone-500 hover:text-[#1B4332] hover:bg-stone-100 rounded-lg transition-colors"
                    title="Edit Banner"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteBanner(b._id, b.title)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            <div className="p-4 sm:p-5 bg-[#1B4332] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base">
                {editingBanner ? 'Edit Hero Banner' : 'Create New Hero Banner'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Great Vedic Health Festival"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-lg outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Up to 35% Off on Pure Classical Samhita Formulations"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-lg outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. AYUSH Certified Standards"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg outline-none focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Festival Deals"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Target Link URL *</label>
                <input
                  type="text"
                  required
                  placeholder="/products?category=ayurvedic-oils"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-lg outline-none focus:border-[#1B4332]"
                />
              </div>

              {/* Image Upload & Presets Section */}
              <div className="space-y-3 bg-stone-50/80 p-4 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-stone-800 font-bold text-sm">
                      Banner Image (Direct File Upload)
                    </label>
                    <p className="text-xs text-stone-500">
                      Upload high-res banner photo from your computer (Recommended: 1600x600px).
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

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleBannerFileUpload(e.target.files[0]);
                  }}
                  className="hidden"
                />

                {/* Drag and Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) handleBannerFileUpload(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#1B4332] bg-emerald-50/60'
                      : 'border-stone-300 hover:border-[#1B4332] bg-white hover:bg-stone-50/50'
                  }`}
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-2">
                      <Loader2 className="w-7 h-7 text-[#1B4332] animate-spin" />
                      <span className="text-sm font-semibold text-stone-700">Uploading banner image to server...</span>
                      <span className="text-xs text-stone-400">Saving securely in high resolution</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center border border-emerald-100 shadow-xs">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-stone-700">
                        <span className="text-[#1B4332] underline decoration-[#D4AF37] decoration-2">Click to browse banner file</span> or drag & drop here
                      </div>
                      <div className="text-xs text-stone-400">
                        PNG, JPG, WEBP, AVIF up to 10MB • Landscape ratio recommended
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

                {/* Live Image Preview with Clear Action */}
                {formData.imageUrl && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
                      <span>Current Banner Image Preview:</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[#1B4332] hover:underline text-[11px]"
                      >
                        Change Image
                      </button>
                    </div>
                    <div className="h-32 sm:h-36 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative group shadow-inner">
                      <img
                        src={formData.imageUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/95 hover:bg-white text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs"
                        >
                          Upload Different Image
                        </button>
                      </div>
                    </div>
                  </div>
                )}



                {/* Fallback URL Input */}
                {showUrlFallback && (
                  <div className="pt-2 border-t border-stone-200">
                    <label className="block text-stone-500 mb-1 text-xs">
                      Manual Image URL (external CDN, optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://... or /uploads/..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded-lg outline-none text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Sort Order (0 = Top)</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full p-2.5 border border-stone-300 rounded-lg outline-none focus:border-[#1B4332]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="is-active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-[#1B4332] w-4 h-4"
                  />
                  <label htmlFor="is-active" className="text-stone-800 font-bold cursor-pointer">
                    Publish Immediately
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold px-5 py-2 rounded-lg flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save Banner</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
