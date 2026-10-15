'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  Users,
  TicketPercent,
  Sliders,
  UserCheck,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Search,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Executive Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products & Catalog', icon: Package },
  { href: '/admin/categories', label: 'Categories & Brands', icon: Layers },
  { href: '/admin/inventory', label: 'Inventory & Stock', icon: Boxes },
  { href: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers & CRM', icon: Users },
  { href: '/admin/coupons', label: 'Coupons & Promos', icon: TicketPercent },
  { href: '/admin/banners', label: 'Banners & Marketing', icon: ImageIcon },
  { href: '/admin/staff', label: 'Staff & Roles (RBAC)', icon: UserCheck },
  { href: '/admin/audit-logs', label: 'Security & Audit Logs', icon: ShieldAlert },
  { href: '/admin/settings', label: 'Store Settings', icon: Sliders },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isStaff, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If viewing bootstrap page, allow layout to pass through
  const isBootstrapPage = pathname === '/admin/bootstrap';

  useEffect(() => {
    if (!loading && !isBootstrapPage) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'customer') {
        router.push('/account');
      }
    }
  }, [user, loading, isBootstrapPage, router]);

  // Close mobile drawer on Escape and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-200">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (isBootstrapPage) {
    return <>{children}</>;
  }

  if (!user || user.role === 'customer') {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-stone-100 text-stone-900 font-sans">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#18181B] text-stone-200 border-r border-stone-800 shrink-0">
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-stone-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <img
              src="/logo-icon.png"
              alt="Triven Ayurveda"
              className="w-8 h-8 object-contain drop-shadow-sm brightness-110"
            />
            <div>
              <span className="font-serif font-bold text-white text-base tracking-wide">
                TRIVEN ERP
              </span>
              <span className="block text-[9px] font-mono tracking-widest text-[#C5A059] uppercase">
                Master Control
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[40px] ${
                  isActive
                    ? 'bg-[#C5A059] text-[#18181B] shadow-sm font-bold'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#18181B]' : 'text-[#C5A059]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Staff footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-800 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="max-w-[110px]">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-stone-400 capitalize truncate">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold transition-colors min-h-[36px]"
          >
            <span>Visit Customer Store</span>
            <ExternalLink className="w-3 h-3 text-[#C5A059]" />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-3 sm:px-8 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 truncate max-w-[170px] sm:max-w-none">
              Apothecary ERP • Super Admin
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            <span className="hidden sm:inline bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-md font-mono">
              ROLE: {user.role.toUpperCase()}
            </span>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 font-semibold text-[#8C5E3C] hover:text-stone-900 hover:underline p-1.5 min-h-[36px]"
            >
              <span className="hidden xs:inline">Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar Off-Canvas Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="relative w-72 max-w-[85vw] bg-[#18181B] text-white flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-200">
              {/* Mobile Drawer Header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-stone-800 bg-stone-900">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logo-icon.png"
                    alt="Triven Ayurveda"
                    className="w-7 h-7 object-contain drop-shadow-sm brightness-110"
                  />
                  <span className="font-serif font-bold text-base text-white">TRIVEN ERP</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation List */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto touch-scroll">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                        isActive
                          ? 'bg-[#C5A059] text-[#18181B] shadow-sm font-bold'
                          : 'text-stone-200 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#18181B]' : 'text-[#C5A059]'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Staff Profile & Logout */}
              <div className="p-4 border-t border-stone-800 bg-stone-900">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-stone-800 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center font-bold text-xs shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-stone-400 capitalize truncate">{user.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors min-h-[44px]"
                >
                  <span>Visit Customer Store</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
