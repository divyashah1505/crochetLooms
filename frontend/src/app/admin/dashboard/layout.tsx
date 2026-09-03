'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '../../../components/admin/AdminSidebar';
import { useAuthStore } from '../../../store/auth.store';
import { Loader } from '../../../components/common/Loader';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { adminToken, isInitialized, initAuth } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    initAuth().then(() => {
      const token = localStorage.getItem('crochet_admin_token');
      if (!token) {
        router.push('/admin/login');
      } else {
        setIsAuthorized(true);
      }
    });
  }, [initAuth, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader message="Verifying Admin Access Portal..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-stone-100 text-stone-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
