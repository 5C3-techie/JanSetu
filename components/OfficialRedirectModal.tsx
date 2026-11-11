'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ExternalLink, ShieldCheck, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface OfficialRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationUrl: string;
  schemeName: string;
  portalName?: string;
  ministry?: string;
}

export default function OfficialRedirectModal({
  isOpen,
  onClose,
  destinationUrl,
  schemeName,
  portalName,
  ministry
}: OfficialRedirectModalProps) {
  const { language } = useLanguage();
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
              {language === 'te' ? 'ధృవీకరించబడిన ప్రభుత్వ పోర్టల్' : 'Verified Government Portal'}
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              {language === 'te' ? 'అధికారిక ప్రభుత్వ వెబ్‌సైట్‌కు వెళ్తున్నారు' : 'Navigating to Official Government Website'}
            </h3>
          </div>
        </div>

        {/* Description & Transparency Notice */}
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed mb-6">
          <p>
            {language === 'te' 
              ? <>మీరు <strong>జన్-సేతు</strong> నుండి అధికారిక పోర్టల్‌కు వెళ్తున్నారు:</> 
              : <>You are leaving <strong>Jan-Setu</strong> to apply directly on the official portal for:</>}
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="font-extrabold text-slate-900 text-sm">{schemeName}</p>
            {portalName && (
              <p className="text-xs text-blue-700 font-bold mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block shrink-0"></span>
                <span>{language === 'te' ? `కేటాయించిన పోర్టల్: ${portalName}` : `Designated Portal: ${portalName}`}</span>
              </p>
            )}
            {ministry && (
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {language === 'te' ? `నిర్వహణ: ${ministry}` : `Administered by: ${ministry}`}
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{language === 'te' ? 'భద్రత & విశ్వసనీయత హామీ' : 'Safety & Authenticity Guarantee'}</span>
            </div>
            <p className="text-[11px] text-blue-950 font-medium">
              {language === 'te'
                ? 'జన్-సేతు ఎటువంటి రుసుములను వసూలు చేయదు మరియు ప్రభుత్వ లాగిన్ వివరాలను సేకరించదు. అన్ని దరఖాస్తులు నేరుగా సంబంధిత ప్రభుత్వ విభాగం ద్వారానే ప్రాసెస్ చేయబడతాయి.'
                : 'Jan-Setu never charges any fees and never collects government login credentials. All applications are processed directly by the designated government department.'}
            </p>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 break-all text-[11px]">
            <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0">
              {language === 'te' ? 'లక్ష్య URL:' : 'Target URL:'}
            </span>
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
            {language === 'te' ? 'రద్దు చేయి' : 'Cancel'}
          </button>
          
          <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all"
          >
            <span>{language === 'te' ? 'అధికారిక వెబ్‌సైట్‌కు వెళ్లండి' : 'Proceed to Official Website'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
