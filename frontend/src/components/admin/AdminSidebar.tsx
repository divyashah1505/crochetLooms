'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag as TagIcon,
  ShoppingCart,
  Users,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { clsx } from 'clsx';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logoutAdmin } = useAuthStore();

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/dashboard/products', icon: Package },
    { label: 'Tag Master', href: '/admin/dashboard/tags', icon: TagIcon },
    { label: 'Categories', href: '/admin/dashboard/categories', icon: FolderTree },
    { label: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingCart },
    { label: 'Customers', href: '/admin/dashboard/customers', icon: Users },
  ];

  return (
    <aside className="w-64 bg-yarn-mocha text-cream-100 flex flex-col flex-shrink-0 min-h-screen border-r border-stone-800">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-stone-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-clay-600 flex items-center justify-center text-lg">
            🧶
          </div>
          <div>
            <h1 className="font-serif-accent text-lg font-bold text-white leading-tight">
              Crochet<span className="text-clay-400">Admin</span>
            </h1>
            <p className="text-[10px] text-cream-400 font-medium">Studio Management Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
                isActive
                  ? 'bg-clay-600 text-white shadow-md'
                  : 'text-cream-300 hover:bg-stone-800 hover:text-white',
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin User Info & Switch to Shop & Logout */}
      <div className="p-4 border-t border-stone-800 space-y-3 bg-stone-900/50">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-800 text-xs font-medium text-cream-300 hover:text-white hover:bg-stone-700 transition-colors"
        >
          <span>View Live Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center justify-between pt-2">
          <div className="truncate max-w-[140px]">
            <p className="text-xs font-bold text-white truncate">{admin?.name || 'Artisan Admin'}</p>
            <p className="text-[10px] text-cream-400 truncate">{admin?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
