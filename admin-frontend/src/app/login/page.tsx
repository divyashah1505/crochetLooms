'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { useAdminAuthStore } from '../../store/auth.store';
import { Button } from '../../components/common/Button';
import { Lock, Mail, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminAuth } = useAdminAuthStore();

  const [email, setEmail] = useState('admin@crochet.com');
  const [password, setPassword] = useState('Admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await authService.loginAdmin({ email, password });
      setAdminAuth(data.admin, data.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail('admin@crochet.com');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-clay-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-clay-500 to-yarn-dustyPink flex items-center justify-center text-3xl shadow-xl">
            🧶
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black text-white tracking-tight">
          Admin Portal Login
        </h2>
        <p className="mt-1 text-center text-xs text-stone-400">
          Sign in to manage crochet catalog, Tag Master, orders & inventory.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-stone-800/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-stone-700 space-y-6">
          {error && (
            <div className="p-3 bg-red-900/40 border border-red-700 text-red-300 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@crochet.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:ring-2 focus:ring-clay-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:ring-2 focus:ring-clay-500 focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
              Sign In to Admin Portal
            </Button>
          </form>

          {/* Quick Demo Fill */}
          <div className="pt-2 border-t border-stone-700/80">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="w-full py-2.5 px-3 bg-stone-700/50 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-600"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Fill Admin: admin@crochet.com</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-clay-400 hover:text-clay-300 hover:underline"
            >
              <span>Back to Storefront (Port 3000)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
