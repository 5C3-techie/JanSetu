'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
    const message = error?.message || '';
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /Loading chunk .* failed/i.test(message) ||
      /Failed to fetch dynamically imported module/i.test(message);

    if (isChunkError && typeof window !== 'undefined') {
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
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Application Error</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Jan-Setu encountered a runtime error. Please reload to restore the session.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                } else {
                  reset();
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

