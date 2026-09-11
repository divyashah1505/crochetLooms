'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { authService } from '../../services/auth.service';
import { Button } from '../common/Button';
import { GoogleSignInButton } from './GoogleSignInButton';
import { X, Mail, Lock, User, Phone, Sparkles, HeartHandshake } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    authModalNotice,
    closeAuthModal,
    setAuthModalMode,
    setCustomerAuth,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.loginCustomer({ email, password });
      setCustomerAuth(result.customer, result.accessToken);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.registerCustomer({
        name,
        email,
        password,
        phone: phone || undefined,
      });
      setCustomerAuth(result.customer, result.accessToken);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('customer@crochet.com');
    setPassword('Customer@123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-cream-200 p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-600 hover:bg-cream-100 rounded-full transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md mx-auto border border-cream-200 bg-white p-0.5">
            <img src="/logo-mark.png" alt="CrochetLoom Logo" className="w-full h-full object-cover rounded-[14px]" />
          </div>
          <h2 className="text-2xl font-black text-yarn-mocha tracking-tight">
            {authModalMode === 'login' ? 'Welcome Back!' : 'Join CrochetLoom'}
          </h2>
          <p className="text-xs text-stone-500">
            {authModalMode === 'login'
              ? 'Sign in to access your crochet cart and handmade orders.'
              : 'Create an account for faster checkout and order tracking.'}
          </p>
        </div>

        {/* Compulsory Notice Banner */}
        {authModalNotice && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl flex items-start gap-2.5 font-medium shadow-xs animate-in fade-in">
            <span className="text-base flex-shrink-0">🔒</span>
            <div className="flex-1">
              <p className="font-bold text-yarn-mocha">Sign In / Sign Up Required</p>
              <p className="text-stone-600 mt-0.5">{authModalNotice}</p>
            </div>
          </div>
        )}

        {/* Tab Switcher (Sign In vs Sign Up) */}
        <div className="grid grid-cols-2 p-1 bg-cream-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setAuthModalMode('login');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              authModalMode === 'login'
                ? 'bg-white text-yarn-mocha shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setAuthModalMode('register');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              authModalMode === 'register'
                ? 'bg-white text-yarn-mocha shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        {/* 1. Google One-Click Sign-In */}
        <div className="mb-5">
          <GoogleSignInButton
            text={authModalMode === 'login' ? 'Continue with Google' : 'Sign Up with Google'}
            onSuccess={() => closeAuthModal()}
          />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-cream-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold uppercase text-stone-400">
            or with email
          </span>
        </div>

        {/* 2. Login or Register Form */}
        {authModalMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@crochet.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <Button type="submit" size="md" className="w-full font-bold mt-2" isLoading={isLoading}>
              Sign In to Account
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Emma Watson"
                  className="w-full pl-10 pr-4 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                  required
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="emma@example.com"
                  className="w-full pl-10 pr-4 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1">
                Password * (Min 6 chars)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                  required
                  minLength={6}
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
              </div>
            </div>

            <Button type="submit" size="md" className="w-full font-bold mt-2" isLoading={isLoading}>
              Complete Registration
            </Button>
          </form>
        )}

        {/* Demo Account Quick Shortcut */}
        {authModalMode === 'login' && (
          <div className="mt-4 pt-4 border-t border-cream-100 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-bold text-clay-600 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5" /> Quick Fill Demo Customer Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
