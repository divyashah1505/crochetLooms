'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tag,
  FolderTree,
  ShoppingCart,
  Users,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAdminAuthStore } from '../../store/auth.store';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logoutAdmin } = useAdminAuthStore();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/dashboard/products', icon: Package },
    { label: 'Tag Master', href: '/dashboard/tags', icon: Tag },
    { label: 'Categories', href: '/dashboard/categories', icon: FolderTree },
    { label: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { label: 'Customers', href: '/dashboard/customers', icon: Users },
  ];

  const handleLogout = () => {
    logoutAdmin();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 min-h-screen flex flex-col justify-between p-4 flex-shrink-0 border-r border-stone-800">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-stone-800 pb-4">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md bg-white border border-stone-700 p-0.5">
            <img src="/logo-mark.png" alt="CrochetLoom Logo" className="w-full h-full object-cover rounded-[14px]" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight leading-tight">
              Crochet<span className="text-clay-400">Loom</span>
            </h2>
            <span className="text-[10px] text-clay-400 font-semibold tracking-wider uppercase">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-clay-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="space-y-3 pt-4 border-t border-stone-800">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-clay-300 hover:bg-stone-800/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront (Port 3000)</span>
          </span>
        </a>

        {admin && (
          <div className="px-3.5 py-2 bg-stone-800/50 rounded-xl">
            <p className="text-xs font-bold text-white truncate">{admin.name}</p>
            <p className="text-[10px] text-stone-400 truncate">{admin.email}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
