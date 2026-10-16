'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, KeyRound, Check, Loader2, ArrowRight } from 'lucide-react';

export default function BootstrapSuperAdminPage() {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Dr. Acharya Devraj',
    email: 'admin@trivenayurveda.com',
    password: '',
    bootstrapToken: 'ayur-admin-setup-secret-2026',
  });

  useEffect(() => {
    const checkInit = async () => {
      try {
        const res = await fetch('/api/auth/bootstrap');
        const json = await res.json();
        if (res.ok) {
          setIsInitialized(json.data.isInitialized);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    checkInit();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to initialize Super Admin');

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-300">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-900 text-stone-100 p-4">
      <div className="max-w-md w-full bg-stone-800/80 backdrop-blur-md p-8 rounded-3xl border border-stone-700 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#18181B] text-[#C5A059] flex items-center justify-center mx-auto border border-[#C5A059]/40 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-[#C5A059]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white">
            Secure Super Admin Bootstrap
          </h1>
          <p className="text-xs text-stone-400">
            One-time cryptographic server initialization for Triven Ayurveda ERP.
          </p>
        </div>

        {isInitialized ? (
          <div className="p-5 rounded-2xl bg-stone-900/90 border border-[#C5A059]/40 text-stone-200 text-xs space-y-3 text-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-[#C5A059] mx-auto" />
            <p className="font-bold text-white text-sm">Super Admin Already Provisioned</p>
            <p className="leading-relaxed">
              The primary Super Admin master key has already been initialized. Public bootstrapping is cryptographically disabled for security.
            </p>
            <Link
              href="/login"
              className="mt-2 inline-flex items-center gap-1.5 font-bold text-[#D4AF37] hover:underline"
            >
              <span>Go to Staff Sign-In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs">
                {error}
              </div>
            )}

            {success ? (
              <div className="p-4 rounded-xl bg-stone-900 border border-[#C5A059]/50 text-[#C5A059] text-xs text-center font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Super Admin account initialized! Redirecting to Master Control...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 mb-1 font-semibold">Super Admin Legal Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-600 bg-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 mb-1 font-semibold">Master Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-600 bg-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 mb-1 font-semibold">Master Password (min 8 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter secure password"
                    className="w-full p-2.5 rounded-xl border border-stone-600 bg-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 mb-1 font-semibold">Server Bootstrap Token</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.bootstrapToken}
                      onChange={(e) => setFormData({ ...formData, bootstrapToken: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-600 bg-stone-700 text-white font-mono"
                    />
                    <KeyRound className="w-4 h-4 text-[#D4AF37] absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Matches ADMIN_BOOTSTRAP_TOKEN in .env
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c29d28] text-stone-900 font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Initialize Super Admin Master Control</span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
