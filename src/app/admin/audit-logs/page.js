'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Check,
  Loader2,
  Calendar,
  Lock,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action', actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setLogs(json.data.logs || []);
        setTotal(json.data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Security & Audit Activity Logs
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Tamper-evident record of all administrative modifications, logins, and inventory ledger commits.
          </p>
        </div>

        <div className="text-xs text-stone-600 bg-white border border-stone-200 px-4 py-2 rounded-xl font-bold self-start">
          Total Events: {total}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-semibold text-stone-500">Filter Event:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2 rounded-xl border border-stone-300 bg-white text-xs w-full sm:w-auto"
          >
            <option value="">All Security Events</option>
            <option value="ORDER_PLACED">ORDER_PLACED</option>
            <option value="STOCK_ADJUSTMENT">STOCK_ADJUSTMENT</option>
            <option value="PRODUCT_CREATE">PRODUCT_CREATE</option>
            <option value="PRODUCT_UPDATE">PRODUCT_UPDATE</option>
            <option value="ORDER_STATUS_UPDATE">ORDER_STATUS_UPDATE</option>
            <option value="STAFF_LOGIN">STAFF_LOGIN</option>
            <option value="STAFF_ONBOARDED">STAFF_ONBOARDED</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor Email</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details / Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B4332]" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    No matching audit records.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-stone-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {log.userEmail || 'system'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-medium">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
