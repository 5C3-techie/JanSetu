'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RouteGuard from '@/components/RouteGuard';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Self-healing ChunkLoadError & dynamic import auto-recovery
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = 'error' in event ? event.error : event.reason;
      const message = error?.message || (typeof error === 'string' ? error : '');
      const isChunkLoadError =
        error?.name === 'ChunkLoadError' ||
        /Loading chunk .* failed/i.test(message) ||
        /Failed to fetch dynamically imported module/i.test(message) ||
        /Cannot find module .* chunks/i.test(message);

      if (isChunkLoadError) {
        console.warn('ChunkLoadError detected. Attempting automatic reload recovery...', error);
        try {
          const lastReload = sessionStorage.getItem('jansetu_chunk_retry');
          const now = Date.now();
          // Avoid loop: only auto-reload if not reloaded within the last 8 seconds
          if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
            sessionStorage.setItem('jansetu_chunk_retry', now.toString());
            window.location.reload();
          }
        } catch {
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleChunkError);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError);
    };
  }, []);

  return (
    <RouteGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </div>
    </RouteGuard>
  );
}
