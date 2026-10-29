'use client';

import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  MessageCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  User,
  Calendar,
  ExternalLink,
} from 'lucide-react';

const STATUS_CONFIG = {
  new: { label: 'New / Not Called', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  contacted: { label: 'Contacted (बात हुई)', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
  confirmed: { label: 'Order Confirmed', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  dispatched: { label: 'COD Dispatched', bg: 'bg-purple-100 text-purple-800 border-purple-300' },
  delivered: { label: 'Delivered (डिलीवर)', bg: 'bg-green-100 text-green-900 border-green-300' },
  cancelled: { label: 'Cancelled / Fake', bg: 'bg-red-100 text-red-800 border-red-300' },
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/quick-orders?limit=100`;
      if (selectedStatus && selectedStatus !== 'all') {
        url += `&status=${selectedStatus}`;
      }
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load leads');

      setLeads(json.data?.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/quick-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update');

      setLeads((prev) =>
        prev.map((lead) => (lead._id === id ? { ...lead, status: newStatus } : lead))
      );
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`/api/quick-orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setLeads((prev) => prev.filter((lead) => lead._id !== id));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Stats calculation
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const confirmedLeads = leads.filter((l) => l.status === 'confirmed' || l.status === 'dispatched').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <span>COD Leads & Quick Inquiries</span>
            <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Ads CRM
            </span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Customer inquiries received from the simplified Name, Number & Bimari COD form.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Total Inquiries
          </span>
          <span className="text-2xl font-serif font-black text-stone-900 mt-1 block">
            {totalLeads}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">From Ad campaigns & Homepage</span>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>New (Pending Call)</span>
          </span>
          <span className="text-2xl font-serif font-black text-amber-900 mt-1 block">
            {newLeads}
          </span>
          <span className="text-[11px] text-amber-700 mt-1 block">Awaiting Vaidya consultation call</span>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed / Dispatched</span>
          </span>
          <span className="text-2xl font-serif font-black text-emerald-900 mt-1 block">
            {confirmedLeads}
          </span>
          <span className="text-[11px] text-emerald-700 mt-1 block">COD orders successfully verified</span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {['all', 'new', 'contacted', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-[#0F1D36] text-[#D4AF37] shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {st === 'all' ? 'All Leads' : st}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 min-w-[260px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, disease..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#C5A059]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Leads Table / List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#C5A059]" />
            <span>Loading leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <PhoneCall className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-800">No leads found</p>
            <p className="text-xs text-stone-500">
              When customers submit the COD form (Name, Number, Bimari), they will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700 divide-y divide-stone-100">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Bimari / Problem</th>
                  <th className="py-3 px-4">Source / Product</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {leads.map((lead) => {
                  const statusConf = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                  const dateStr = new Date(lead.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={lead._id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Customer Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-900 text-sm">{lead.name}</span>
                          <span className="font-mono text-stone-600 text-xs mt-0.5">
                            +91 {lead.phone}
                          </span>
                        </div>
                      </td>

                      {/* Bimari / Health Problem */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold max-w-[240px] truncate">
                          {lead.disease}
                        </span>
                      </td>

                      {/* Source / Product */}
                      <td className="py-3.5 px-4 text-stone-600">
                        <span className="block truncate max-w-[180px] text-[11px]">
                          {lead.productName || 'General COD Order'}
                        </span>
                        <span className="text-[10px] text-stone-400 capitalize">
                          {lead.source?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[11px] text-stone-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          disabled={updatingId === lead._id}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-all cursor-pointer ${statusConf.bg}`}
                        >
                          <option value="new">New (Pending Call)</option>
                          <option value="contacted">Contacted (बात हुई)</option>
                          <option value="confirmed">Confirmed (Order Accepted)</option>
                          <option value="dispatched">Dispatched (COD Sent)</option>
                          <option value="delivered">Delivered (Success)</option>
                          <option value="cancelled">Cancelled / Fake</option>
                        </select>
                      </td>

                      {/* Action Buttons: Direct Call & WhatsApp */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct Call Link */}
                          <a
                            href={`tel:+91${lead.phone}`}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            title={`Call ${lead.name}`}
                          >
                            <PhoneCall className="w-4 h-4" />
                          </a>

                          {/* WhatsApp Direct Chat Link */}
                          <a
                            href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(
                              `नमस्ते ${lead.name} जी, त्रिवेण आयुर्वेद से संपर्क कर रहे हैं। आपने ${lead.disease} के लिए COD आर्डर अनुरोध भेजा था। क्या हम आपको अधिक जानकारी दे सकते हैं?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-colors"
                            title={`WhatsApp ${lead.name}`}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

