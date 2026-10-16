'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  History,
  Check,
  Search,
  Filter,
  Loader2,
  Calendar,
  X,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'low_stock', 'out_of_stock'
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustData, setAdjustData] = useState({
    quantityDelta: 10,
    type: 'purchase', // 'purchase', 'adjustment', 'damaged', 'expired'
    reason: 'Restocking fresh batch from Uttarakhand farm',
    batchNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?filter=${filter}`);
      const json = await res.json();
      if (res.ok) {
        setInventoryData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filter]);

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

  const handleOpenAdjust = (p) => {
    setSelectedProduct(p);
    setAdjustData({
      quantityDelta: 10,
      type: 'purchase',
      reason: 'Batch receipt verification',
      batchNumber: p.batchNumber || '',
    });
    setModalOpen(true);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSaving(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: selectedProduct.sku,
          quantityDelta: Number(adjustData.quantityDelta),
          type: adjustData.type,
          reason: adjustData.reason,
          batchNumber: adjustData.batchNumber,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to adjust stock');
      }

      setModalOpen(false);
      setMsg(`Stock for SKU ${selectedProduct.sku} updated and audited.`);
      setTimeout(() => setMsg(null), 3000);
      fetchInventory();
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
            Inventory & Warehouse Stock Control
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit-backed stock adjustments, batch allocations, and real-time replenishment.
          </p>
        </div>

        {inventoryData?.stats && (
          <div className="flex gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 font-bold">
              Total SKUs: {inventoryData.stats.totalProducts}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold">
              Low Stock: {inventoryData.stats.lowStockCount}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-800 font-bold">
              Out of Stock: {inventoryData.stats.outOfStockCount}
            </span>
          </div>
        )}
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-amber-700" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[#18181B] text-[#C5A059] border border-[#C5A059]/40 shadow-xs'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          All Inventory
        </button>
        <button
          onClick={() => setFilter('low_stock')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            filter === 'low_stock'
              ? 'bg-[#18181B] text-[#C5A059] border border-[#C5A059]/40 shadow-xs'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          Low Stock Alerts
        </button>
        <button
          onClick={() => setFilter('out_of_stock')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            filter === 'out_of_stock'
              ? 'bg-[#18181B] text-[#C5A059] border border-[#C5A059]/40 shadow-xs'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          Out of Stock SKUs
        </button>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">SKU & Product</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#C5A059]" />
                    <span>Loading warehouse inventory...</span>
                  </td>
                </tr>
              ) : inventoryData?.products?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No matching inventory records.
                  </td>
                </tr>
              ) : (
                inventoryData?.products?.map((p) => {
                  const isLow = p.stock <= p.lowStockThreshold;

                  return (
                    <tr key={p._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900">{p.name}</p>
                        <p className="font-mono text-[10px] text-stone-400">{p.sku}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold text-sm ${isLow ? 'text-red-600' : 'text-stone-900'}`}>
                          {p.stock} units
                        </span>
                        {isLow && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-semibold">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Low Stock Threshold Alert</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {p.lowStockThreshold} units
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-600">
                        {p.batchNumber || 'Batch-A1'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        ₹{p.sellingPrice}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="px-3 py-1.5 rounded-lg bg-[#18181B] text-[#C5A059] border border-[#C5A059]/40 hover:bg-stone-900 font-semibold text-xs transition-colors"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Audit Log Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-4">
        <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
          <History className="w-4 h-4 text-[#D4AF37]" />
          Recent Stock Movement Ledger (Audit Trail)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Delta</th>
                <th className="py-2.5 px-3">Prev → New</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Reason / Authorizer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {inventoryData?.movements?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                inventoryData?.movements?.map((m) => (
                  <tr key={m._id} className="text-stone-700">
                    <td className="py-2.5 px-3 text-stone-400">
                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                      {m.sku}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      <span className={m.quantityDelta > 0 ? 'text-[#8C5E3C]' : 'text-red-600'}>
                        {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {m.previousStock} → {m.newStock}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="capitalize font-medium">{m.type}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-stone-900">{m.reason}</p>
                      <p className="text-[10px] text-stone-400">{m.userEmail || 'System Action'}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUSTMENT MODAL */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-5 my-auto border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h2 className="font-serif font-bold text-base text-stone-900">
                Adjust Inventory: {selectedProduct.name}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-xs text-stone-500 font-mono">
                SKU: {selectedProduct.sku} | Current Stock: <strong>{selectedProduct.stock}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Adjustment Type</label>
                <select
                  value={adjustData.type}
                  onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="purchase">Stock Receipt / Purchase (+)</option>
                  <option value="adjustment">Manual Count Correction (+ or -)</option>
                  <option value="damaged">Damaged in Transit / Scrap (-)</option>
                  <option value="expired">Expired Botanical Batch (-)</option>
                  <option value="return">Customer Return (+)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Quantity Delta (e.g. +20 or -5) *</label>
                <input
                  type="number"
                  required
                  value={adjustData.quantityDelta}
                  onChange={(e) => setAdjustData({ ...adjustData, quantityDelta: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Batch / Lot Number</label>
                <input
                  type="text"
                  value={adjustData.batchNumber}
                  onChange={(e) => setAdjustData({ ...adjustData, batchNumber: e.target.value })}
                  placeholder="e.g. BATCH-2026-X8"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Mandatory Audit Reason *</label>
                <textarea
                  required
                  rows={2}
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="State reason for stock adjustment..."
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
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
                  <span>Commit Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
