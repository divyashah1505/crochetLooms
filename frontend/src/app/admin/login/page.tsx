'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';
import { Button } from '../../../components/common/Button';
import { ShieldCheck, Mail, Lock, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.loginAdmin({ email, password });
      setAdminAuth(result.admin, result.accessToken);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@crochet.com');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen bg-yarn-mocha flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-stone-800 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-clay-600 text-white flex items-center justify-center text-2xl mx-auto shadow-lg">
            🛡️
          </div>
          <h1 className="text-2xl font-black text-yarn-mocha tracking-tight">
            Artisan Admin Portal
          </h1>
          <p className="text-xs text-stone-500">
            Secure management console for products, Tag Master, and orders.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@crochet.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                required
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                required
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full font-bold bg-clay-600 hover:bg-clay-700" isLoading={isLoading}>
            Authenticate to Dashboard
          </Button>
        </form>

        {/* Demo Admin Auto-Fill */}
        <div className="p-3 bg-cream-100/60 rounded-2xl border border-cream-200 text-center space-y-1">
          <p className="text-[11px] text-stone-500">Quick-fill seeded master admin credentials:</p>
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="text-xs font-bold text-clay-700 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-clay-600" /> Use admin@crochet.com / Admin@123
          </button>
        </div>
      </div>
    </div>
  );
}
