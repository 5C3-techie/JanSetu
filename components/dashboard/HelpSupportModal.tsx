'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  X, 
  HelpCircle, 
  PhoneCall, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  MessageCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpSupportModal({ isOpen, onClose }: HelpSupportModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/80 p-6 z-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'te' ? 'సహాయం & మద్దతు' : 'Citizen Help & Support'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'జన్-సేతు సహాయ కేంద్రాన్ని సంప్రదించండి' : 'Government helpline contacts & platform assistance'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Civic Helplines */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Official Civic Helplines
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>National Welfare Help</span>
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-base font-extrabold text-blue-700">14434</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Toll-free 24x7
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Telangana Meeseva</span>
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-base font-extrabold text-blue-700">040-48560012</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Mon - Sat 9AM - 6PM
              </p>
            </div>
          </div>
        </div>

        {/* Quick Citizen FAQs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Frequently Asked Questions
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-1">How does eligibility matching work?</h4>
              <p className="text-slate-600 leading-relaxed">
                Jan-Setu uses transparent, deterministic rules based on official ministry guidelines (age, occupation, income, and residence). We never use arbitrary AI scores to decide eligibility.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-1">Are my uploaded documents secure?</h4>
              <p className="text-slate-600 leading-relaxed">
                Yes. Your documents are stored in your private secure vault and are only used to check your application readiness. We never share documents with unverified third parties.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-1">Where do I submit official applications?</h4>
              <p className="text-slate-600 leading-relaxed">
                Jan-Setu helps you prepare documents and track deadlines. Official submissions take place on designated ministry portals or local CSC / Meeseva centers.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <Link
            href="/csc"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Locate Nearest CSC Center</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
