'use client';

import React from 'react';
import { ExternalLink, ShieldCheck, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface OfficialRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationUrl: string;
  schemeName: string;
  ministry?: string;
}

export default function OfficialRedirectModal({
  isOpen,
  onClose,
  destinationUrl,
  schemeName,
  ministry
}: OfficialRedirectModalProps) {
  if (!isOpen) return null;

  const isOfficialGov = destinationUrl.includes('.gov.in') || destinationUrl.includes('.nic.in');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-200 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Verified Government Portal
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Navigating to Official Government Website
            </h3>
          </div>
        </div>

        {/* Description & Transparency Notice */}
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed mb-6">
          <p>
            You are leaving <strong>Jan-Setu</strong> to apply directly on the official portal for:
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="font-extrabold text-slate-900 text-sm">{schemeName}</p>
            {ministry && (
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Administered by: {ministry}
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Safety & Authenticity Guarantee</span>
            </div>
            <p className="text-[11px] text-blue-950 font-medium">
              Jan-Setu never charges any fees and never collects government login credentials. All applications are processed directly by the designated government department.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 break-all text-[11px]">
            <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0">Target URL:</span>
            <code className="text-emerald-800 font-semibold">{destinationUrl}</code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          
          <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all"
          >
            <span>Proceed to Official Website</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
