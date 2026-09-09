'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/common/Button';
import { GoogleSignInButton } from '../../components/customer/GoogleSignInButton';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { setCustomerAuth, customerToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, immediately redirect to target page
  React.useEffect(() => {
    const token = customerToken || (typeof window !== 'undefined' ? localStorage.getItem('crochet_customer_token') : null);
    if (token) {
      router.replace(redirectUrl);
    }
  }, [customerToken, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.loginCustomer({ email, password });
      setCustomerAuth(result.customer, result.accessToken);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('customer@crochet.com');
    setPassword('Customer@123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-clay-500 to-yarn-dustyPink flex items-center justify-center text-2xl mx-auto shadow-md">
            🧶
          </div>
          <h1 className="text-2xl font-extrabold text-yarn-mocha tracking-tight">
            Welcome Back!
          </h1>
          <p className="text-xs text-stone-500">
            Sign in to access your crochet cart, orders, and saved addresses.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        {/* 1. Google Sign-In Option */}
        <div>
          <GoogleSignInButton
            text="Continue with Google"
            redirectTo={redirectUrl}
          />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-cream-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold uppercase text-stone-400">
            or sign in with email
          </span>
        </div>

        {/* 2. Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@crochet.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                required
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                required
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full font-bold" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        {/* Demo Account Quick-Fill */}
        <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200 text-center space-y-1">
          <p className="text-[11px] text-stone-500">Want to test with a seeded demo account?</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="text-xs font-bold text-clay-600 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" /> Fill Demo Customer Credentials
          </button>
        </div>

        {/* Register link */}
        <p className="text-center text-xs text-stone-600">
          New to CrochetLoom?{' '}
          <Link href={`/register?redirect=${encodeURIComponent(redirectUrl)}`} className="font-bold text-clay-700 hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
