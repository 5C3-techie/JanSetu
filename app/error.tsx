'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Runtime Error:', error);

    // Auto-recover from chunk load errors by reloading the fresh bundle
    const message = error?.message || '';
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /Loading chunk .* failed/i.test(message) ||
      /Failed to fetch dynamically imported module/i.test(message);

    if (isChunkError) {
      try {
        const last = sessionStorage.getItem('jansetu_chunk_retry');
        const now = Date.now();
        if (!last || now - parseInt(last, 10) > 8000) {
          sessionStorage.setItem('jansetu_chunk_retry', now.toString());
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-xs">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-xl font-black text-slate-900">Something went wrong</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The page encountered a temporary runtime or connection issue. A quick refresh usually resolves this.
        </p>
        {process.env.NODE_ENV !== 'production' && error?.message && (
          <div className="p-3 bg-slate-100 rounded-xl text-left text-[11px] text-slate-700 font-mono break-all mt-2">
            {error.message}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reload Page</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}

