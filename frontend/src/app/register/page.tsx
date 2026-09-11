'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/common/Button';
import { GoogleSignInButton } from '../../components/customer/GoogleSignInButton';
import { User, Mail, Lock, Phone } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { setCustomerAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone.trim() || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number (required for order updates).');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.registerCustomer({
        name,
        email,
        password,
        phone: phone.trim(),
      });
      setCustomerAuth(result.customer, result.accessToken);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md mx-auto border border-cream-200 bg-white p-0.5">
            <img src="/logo-mark.png" alt="CrochetLoom Logo" className="w-full h-full object-cover rounded-[14px]" />
          </div>
          <h1 className="text-2xl font-extrabold text-yarn-mocha tracking-tight">
            Join the Artisan Community
          </h1>
          <p className="text-xs text-stone-500">
            Create an account to save custom favorites, checkout faster, and track handmade orders.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        {/* 1. Google Sign-Up Option */}
        <div>
          <GoogleSignInButton
            text="Sign Up with Google"
            redirectTo={redirectUrl}
          />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-cream-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold uppercase text-stone-400">
            or sign up with email
          </span>
        </div>

        {/* 2. Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Emma Watson"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                required
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="emma@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                required
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Password * (Min 6 chars)
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                required
                minLength={6}
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210 (10 digits)"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                required
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Required for instant order confirmation and delivery notifications.</p>
          </div>

          <Button type="submit" size="lg" className="w-full font-bold" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-xs text-stone-600">
          Already have an account?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="font-bold text-clay-700 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
