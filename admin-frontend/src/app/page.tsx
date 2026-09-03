'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '../store/auth.store';
import { Loader } from '../components/common/Loader';

export default function RootAdminPage() {
  const router = useRouter();
  const { initAuth } = useAdminAuthStore();

  useEffect(() => {
    initAuth().then(() => {
      const token = localStorage.getItem('crochet_admin_token');
      if (token) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    });
  }, [router, initAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader message="Accessing admin workspace..." />
    </div>
  );
}
