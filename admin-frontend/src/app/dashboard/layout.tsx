'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useAdminAuthStore } from '../../store/auth.store';
import { Loader } from '../../components/common/Loader';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { adminToken, isInitialized, initAuth } = useAdminAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    initAuth().then(() => {
      const token = localStorage.getItem('crochet_admin_token');
      if (!token) {
        router.push('/login');
      } else {
        setChecking(false);
      }
    });
  }, [router, initAuth]);

  if (checking) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <Loader message="Verifying admin credentials..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream-50/50">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
