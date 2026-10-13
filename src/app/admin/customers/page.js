'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Check,
  X,
  FileText,
  UserX,
  UserCheck,
  Loader2,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [msg, setMsg] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (res.ok) {
        setCustomers(json.data.customers || []);
        setTotal(json.data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCustomer) {
        setSelectedCustomer(null);
      }
    };
    if (selectedCustomer) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCustomer]);

  const handleToggleStatus = async (cust) => {
    const newStatus = cust.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to mark ${cust.name} as ${newStatus}?`)) return;

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: cust._id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setMsg(`Customer ${cust.name} status updated to ${newStatus}.`);
        setTimeout(() => setMsg(null), 3000);
        fetchCustomers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !noteText.trim()) return;

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          note: noteText.trim(),
        }),
      });

      if (res.ok) {
        setNoteText('');
        setMsg('Support note added to customer profile.');
        setTimeout(() => setMsg(null), 3000);
        setSelectedCustomer(null);
        fetchCustomers();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            View registered customer profiles, lifetime order counts, and internal Vaidya support notes.
          </p>
        </div>

        <div className="text-xs text-stone-600 bg-white border border-stone-200 px-4 py-2 rounded-xl font-bold self-start">
          Total Customers: {total}
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search patient name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Lifetime Orders</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B4332]" />
                    <span>Loading customers...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-900">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {c.email}
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {c.phone || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md">
                        {c.orderCount || 0} orders
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold"
                        >
                          Notes
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`p-1.5 rounded-lg ${
                            c.status === 'active'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={c.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                        >
                          {c.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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

      {/* SUPPORT NOTES MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 my-auto border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Customer Support Notes: {selectedCustomer.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing notes */}
            <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
              {selectedCustomer.customerNotes?.length === 0 ? (
                <p className="text-stone-400 italic">No notes recorded yet.</p>
              ) : (
                selectedCustomer.customerNotes?.map((n, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <p className="text-stone-800">{n.note}</p>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Add note */}
            <form onSubmit={handleAddNote} className="space-y-3 text-xs pt-2">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">New Internal Note</label>
                <textarea
                  required
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record consultation guidance or delivery preferences..."
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-1.5 border rounded-xl text-stone-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1B4332] text-white rounded-xl font-bold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
