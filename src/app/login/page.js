'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, AlertCircle, Loader2, ArrowRight, Lock } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const initialMode = searchParams.get('mode') || '';
  const { login, register, user, isStaff } = useAuth();

  const [isRegistering, setIsRegistering] = useState(initialMode === 'register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Standard Amazon-style Sign-In authentication
    document.title = 'Amazon-Style Sign-In | Triven Ayurveda';
  }, []);

  // If already logged in, redirect to requested target or account
  useEffect(() => {
    if (user) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (isStaff) {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  }, [user, isStaff, redirectUrl, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        if (!formData.phone || formData.phone.length !== 10) {
          throw new Error('Please enter a valid 10-digit Indian mobile number');
        }
        await register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email.trim() || '',
          password: formData.password,
        });
        router.push(redirectUrl || '/account');
      } else {
        const loggedIn = await login(formData.email.trim(), formData.password);
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (loggedIn.role !== 'customer') {
          router.push('/admin');
        } else {
          router.push('/account');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[380px]">
      {/* Checkout notice if redirected from checkout */}
      {redirectUrl.includes('/checkout') && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-stone-800 text-xs flex items-start gap-2.5 shadow-2xs">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-900">Sign in to place your order</p>
            <p className="text-[11px] text-stone-600">
              Amazon-standard verified authentication ensures real-time PIN tracking and doorstep delivery.
            </p>
          </div>
        </div>
      )}

      {/* Amazon-style Sign-In Card */}
      <div className="bg-white border border-stone-300 rounded-xl p-6 sm:p-7 shadow-xs">
        <h1 className="font-serif font-bold text-2xl text-stone-900 mb-4">
          {isRegistering ? 'Create Account' : 'Sign in'}
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegistering ? (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Your name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="First and last name"
                  className="w-full px-3 py-2 sm:py-2.5 border border-stone-400 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] rounded text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Mobile number *
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-stone-400 bg-stone-100 text-stone-600 text-xs font-semibold select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10),
                      })
                    }
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 sm:py-2.5 border border-stone-400 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] rounded-r text-sm outline-none transition-all"
                  />
                </div>
                <p className="mt-1 text-[11px] text-stone-500">
                  Required for delivery tracking & OTP notifications.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                  <span>Email address</span>
                  <span className="text-[11px] font-normal text-stone-500">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com (optional)"
                  className="w-full px-3 py-2 sm:py-2.5 border border-stone-400 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] rounded text-sm outline-none transition-all"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Email or mobile phone number *
              </label>
              <input
                type="text"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Mobile number or email"
                className="w-full px-3 py-2 sm:py-2.5 border border-stone-400 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] rounded text-sm outline-none transition-all"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-800">
                Password *
              </label>
              {!isRegistering && (
                <span className="text-xs text-[#1B4332] hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              )}
            </div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={isRegistering ? 'At least 6 characters' : 'Enter password'}
              className="w-full px-3 py-2 sm:py-2.5 border border-stone-400 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] rounded text-sm outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 min-h-[44px] bg-[#D4AF37] hover:bg-[#c49e29] text-[#1B4332] font-bold py-2.5 px-4 rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#1B4332]" />
            ) : (
              <span>{isRegistering ? 'Verify & Create Account' : 'Sign in to Continue'}</span>
            )}
          </button>
        </form>

        {/* Amazon Statutory Note */}
        <div className="mt-4 pt-4 border-t border-stone-200 text-[11px] text-stone-600 leading-relaxed">
          By continuing, you agree to Triven Ayurveda's{' '}
          <Link href="/products" className="text-[#1B4332] hover:underline">
            Conditions of Use
          </Link>{' '}
          and{' '}
          <Link href="/products" className="text-[#1B4332] hover:underline">
            Privacy Notice
          </Link>
          .
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 text-xs">
          {isRegistering ? (
            <p className="text-stone-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="font-bold text-[#1B4332] hover:underline"
              >
                Sign in
              </button>
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-stone-600">
                <span className="text-[#1B4332] hover:underline cursor-pointer">▸ Need help?</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Amazon Divider and 'Create account' button */}
      {!isRegistering && (
        <div className="w-full mt-6">
          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-stone-300 w-full" />
            <span className="bg-white px-3 text-xs text-stone-500 shrink-0">
              New to Triven Ayurveda?
            </span>
            <div className="border-t border-stone-300 w-full" />
          </div>

          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className="w-full min-h-[44px] bg-stone-50 hover:bg-stone-100 text-stone-800 font-semibold py-2.5 px-4 rounded-lg text-xs border border-stone-300 shadow-2xs transition-colors flex items-center justify-center"
          >
            Create your Triven account
          </button>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-stone-800">
      <div className="flex-1 flex flex-col items-center pt-8 pb-12 px-4 sm:px-6">
        {/* Amazon-style Centered Brand Logo */}
        <Link href="/" className="flex items-center gap-2 mb-6 group">
          <div className="w-10 h-10 rounded-full bg-[#1B4332] text-[#D4AF37] flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
            ॐ
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1B4332]">
              TRIVEN
            </span>
            <span className="text-[9px] tracking-widest uppercase font-semibold text-stone-500">
              Ayurveda • Haridwar
            </span>
          </div>
        </Link>

        <Suspense
          fallback={
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#1B4332] mx-auto mb-2" />
              <p className="text-xs text-stone-500">Loading secure sign-in...</p>
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </div>

      {/* Amazon Auth Footer */}
      <div className="border-t border-stone-200 py-6 bg-stone-50/60 text-center text-xs text-stone-500 space-y-2">
        <div className="flex justify-center gap-6">
          <Link href="/products" className="hover:underline hover:text-[#1B4332]">
            Conditions of Use
          </Link>
          <Link href="/products" className="hover:underline hover:text-[#1B4332]">
            Privacy Notice
          </Link>
          <Link href="/products" className="hover:underline hover:text-[#1B4332]">
            AYUSH Compliance Notice
          </Link>
        </div>
        <p className="text-[11px] text-stone-400">
          © 2026 Triven Ayurveda Labs Pvt Ltd. Handcrafted in Haridwar, Uttarakhand.
        </p>
      </div>
    </div>
  );
}
