'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Heart,
  Sparkles,
  LogOut,
  Package,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore } from '../../store/cart.store';
import { useChatStore } from '../../store/chat.store';
import { categoryService } from '../../services/category.service';
import { Category } from '../../types/category';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { customer, customerToken, logoutCustomer, initAuth, openAuthModal } = useAuthStore();
  const { cart, toggleDrawer, fetchCart } = useCartStore();
  const { openChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    initAuth();
    categoryService.getCategories().then((cats) => {
      setCategories(cats || []);
    });
  }, [initAuth]);

  useEffect(() => {
    if (customerToken) {
      fetchCart();
    }
  }, [customerToken, fetchCart]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const totalCartCount = cart?.totalItems || 0;
  const parentCategories = categories.filter((c) => !c.parentId);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-clay-600 via-clay-500 to-yarn-terracotta text-white text-xs font-medium py-1.5 px-4 text-center tracking-wide">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yarn-honey animate-pulse" />
          Handmade with pure love & organic cotton yarn • Free shipping on orders above ₹1,000
        </span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-stone-700 hover:bg-cream-200"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-xs group-hover:scale-105 group-hover:shadow-md transition-all duration-300 bg-white border border-cream-200 p-0.5">
                <img
                  src="/logo-mark.png"
                  alt="CrochetLoom Artisanal Logo"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-accent text-2xl font-bold tracking-tight text-yarn-mocha leading-tight">
                  Crochet<span className="text-clay-600">Loom</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-clay-500">
                  Artisanal Handcrafts
                </span>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search daisy purse, bouquets, plushies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-cream-300 rounded-full focus:outline-none focus:ring-2 focus:ring-clay-500 focus:border-transparent placeholder-stone-400 transition-all"
                />
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
              </form>
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-stone-700">
              <Link href="/products" className="hover:text-clay-600 transition-colors">
                All Creations
              </Link>

              {/* Categories & Subcategories Dropdown Mega Menu */}
              <div
                className="relative group"
                onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                onMouseLeave={() => setIsCategoryDropdownOpen(false)}
              >
                <button
                  className="flex items-center gap-1 hover:text-clay-600 py-2 transition-colors font-semibold text-yarn-mocha"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                >
                  <span>Categories</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:rotate-180 transition-transform" />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-[600px] bg-white rounded-3xl shadow-2xl border border-cream-200 p-6 z-50 animate-fadeIn grid grid-cols-2 gap-6">
                    {parentCategories.map((parent) => {
                      const subcats = categories.filter((c) => c.parentId === parent.id);
                      return (
                        <div key={parent.id} className="space-y-2">
                          <Link
                            href={`/products?category=${parent.slug}`}
                            onClick={() => setIsCategoryDropdownOpen(false)}
                            className="font-bold text-xs uppercase tracking-wider text-clay-700 hover:text-clay-900 flex items-center justify-between pb-1 border-b border-cream-100"
                          >
                            <span>{parent.name}</span>
                            <span className="text-[10px] text-stone-400 font-normal">View all →</span>
                          </Link>

                          <div className="space-y-1">
                            {subcats.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/products?category=${sub.slug}`}
                                onClick={() => setIsCategoryDropdownOpen(false)}
                                className="block text-xs text-stone-600 hover:text-clay-600 hover:translate-x-1 transition-all py-0.5"
                              >
                                └─ {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link href="/products?tag=flower" className="hover:text-clay-600 transition-colors flex items-center gap-1">
                <span>🌸</span> Flowers
              </Link>
              <Link href="/products?tag=purse" className="hover:text-clay-600 transition-colors flex items-center gap-1">
                <span>👜</span> Purses
              </Link>
              <Link href="/products?tag=amigurumi" className="hover:text-clay-600 transition-colors flex items-center gap-1">
                <span>🧸</span> Plushies
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* User / Auth Menu */}
              {customer ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-cream-200 transition-colors"
                  >
                    {customer.avatarUrl ? (
                      <img
                        src={customer.avatarUrl}
                        alt={customer.name}
                        className="w-8 h-8 rounded-full border border-clay-300 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-clay-100 text-clay-700 font-bold flex items-center justify-center text-xs border border-clay-300">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline text-xs font-semibold text-yarn-mocha max-w-[100px] truncate">
                      {customer.name.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-cream-200 py-2 z-50 animate-fadeIn"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-cream-100">
                        <p className="text-xs font-semibold text-yarn-mocha truncate">{customer.name}</p>
                        <p className="text-[11px] text-stone-500 truncate">{customer.email}</p>
                      </div>
                      <Link
                        href="/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-cream-100 hover:text-clay-700"
                      >
                        <Package className="w-4 h-4 text-clay-500" />
                        My Orders
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-cream-100 hover:text-clay-700"
                      >
                        <User className="w-4 h-4 text-clay-500" />
                        Account Settings
                      </Link>
                      <button
                        onClick={logoutCustomer}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-clay-600 hover:bg-clay-700 active:scale-95 rounded-full transition-all shadow-xs"
                  title="Sign In or Sign Up"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In / Sign Up</span>
                </button>
              )}

              {/* Chatbot Trigger Option */}
              <button
                onClick={openChat}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-clay-100/80 hover:bg-clay-200 text-clay-800 text-xs font-semibold transition-all shadow-xs"
                title="Chat with our AI Crochet Assistant"
              >
                <MessageCircle className="w-4 h-4 text-clay-600" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>

              {/* Cart Drawer Trigger */}
              <button
                onClick={toggleDrawer}
                className="relative p-2.5 rounded-full bg-clay-50 text-clay-700 hover:bg-clay-100 transition-colors shadow-xs"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-clay-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Admin Dashboard shortcut */}
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noreferrer"
                title="Admin Management Portal (Port 3001)"
                className="hidden md:flex items-center p-2 text-stone-400 hover:text-clay-700 rounded-full hover:bg-cream-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products, flowers, bags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-cream-300 rounded-full focus:outline-none focus:ring-2 focus:ring-clay-500"
              />
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
            </form>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-cream-200 bg-cream-50 px-4 pt-3 pb-6 space-y-2 animate-fadeIn max-h-[80vh] overflow-y-auto">
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-yarn-mocha hover:bg-cream-200"
            >
              All Creations
            </Link>

            {/* Mobile Categories & Subcategories */}
            <div className="space-y-1 pt-1 border-t border-cream-200">
              <p className="px-3 text-xs font-bold text-clay-700 uppercase tracking-wider">
                Categories & Subcategories:
              </p>
              {parentCategories.map((parent) => {
                const subcats = categories.filter((c) => c.parentId === parent.id);
                return (
                  <div key={parent.id} className="pl-2 space-y-1">
                    <Link
                      href={`/products?category=${parent.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-xl text-xs font-bold text-stone-800 hover:bg-cream-200"
                    >
                      📁 {parent.name}
                    </Link>
                    {subcats.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/products?category=${sub.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block pl-6 pr-3 py-1 rounded-xl text-xs text-stone-600 hover:text-clay-700"
                      >
                        └─ {sub.name}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>

            {!customer && (
              <div className="pt-3 border-t border-cream-200">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 rounded-xl bg-clay-600 text-xs font-bold text-white text-center flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-transform"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Sign Up</span>
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openChat();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-clay-100 text-clay-800 hover:bg-clay-200 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-clay-600" />
              <span>🧶 Chat with Crochet Assistant</span>
            </button>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-clay-700 hover:bg-cream-200"
            >
              👑 Admin Portal (Port 3001)
            </a>
          </div>
        )}
      </header>
    </>
  );
};
