'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { profileStore, schemeStore, documentStore, reminderStore, EligibilityResult } from '@/lib/storage';
import { evaluateEligibility } from '@/lib/eligibility/engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  Calendar, 
  ExternalLink, 
  ArrowLeft, 
  Sparkles, 
  Bell, 
  FolderLock, 
  Info,
  Loader2
} from 'lucide-react';

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const schemeId = params.id as string;

  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [explanation, setExplanation] = useState<{ whyMatched: string[]; missingRequirements: string[]; friendlySummary: string } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  useEffect(() => {
    const profile = profileStore.getProfile();
    const scheme = schemeStore.getSchemeById(schemeId);
    const docs = documentStore.getDocuments();

    if (scheme) {
      const evalResult = evaluateEligibility(profile, scheme, docs);
      setResult(evalResult);

      // Fetch Gemini explanation from server endpoint
      setLoadingAi(true);
      fetch('/api/explain-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, result: evalResult, lang: language }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.explanation) setExplanation(data.explanation);
        })
        .catch(err => console.error('Gemini explanation error:', err))
        .finally(() => setLoadingAi(false));
    }
  }, [schemeId, language]);

  if (!result) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-sm text-slate-500">Scheme details not found.</p>
        <Link href="/schemes" className="text-xs font-bold text-blue-600 hover:underline">
          Return to Scheme Explorer
        </Link>
      </div>
    );
  }

  const { scheme, matchStatus, availableDocuments, missingDocuments, readinessLabel, readinessPercentage } = result;

  const isMatched = matchStatus === 'MATCHED';
  const isPartial = matchStatus === 'PARTIAL_MATCH';

  const handleSetReminder = () => {
    if (!scheme.deadline) {
      alert('This scheme operates on a rolling window without a fixed calendar deadline.');
      return;
    }
    reminderStore.addReminder({
      userId: 'citizen_demo_01',
      schemeId: scheme.schemeId,
      schemeName: scheme.name,
      deadline: scheme.deadline,
      reminderDate: scheme.deadline,
      reminderType: '7_days_before',
      notes: `Application reminder for ${scheme.name}`,
    });
    setReminderSet(true);
    setTimeout(() => setReminderSet(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      
      {/* Back Button */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Benefit Radar</span>
      </Link>

      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {scheme.sector} Sector
          </span>

          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
            isMatched
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : isPartial
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-slate-200 text-slate-700'
          }`}>
            {isMatched ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
            <span>{isMatched ? t.matched : isPartial ? t.partialMatch : t.notMatched}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">
            {language === 'te' ? scheme.teluguName : scheme.name}
          </h1>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {language === 'te' ? scheme.teluguDescription : scheme.description}
          </p>
        </div>

        {/* STATUTORY DISCLAIMER */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t.disclaimerText}
          </p>
        </div>
      </div>

      {/* GEMINI AI MATCH EXPLANATION SECTION */}
      <div className="bg-gradient-to-tr from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <h2 className="text-base font-bold">Jan-Setu AI Explanation Layer</h2>
        </div>

        {loadingAi ? (
          <div className="flex items-center gap-2 text-xs text-slate-300 py-4">
            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
            <span>Generating simple explanation with Gemini AI...</span>
          </div>
        ) : explanation ? (
          <div className="space-y-4 text-xs">
            <p className="text-slate-200 text-sm font-medium leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/10">
              "{explanation.friendlySummary}"
            </p>

            {explanation.whyMatched.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Why You May Qualify</h4>
                <ul className="space-y-1 text-slate-200">
                  {explanation.whyMatched.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {explanation.missingRequirements.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">Items Needing Verification</h4>
                <ul className="space-y-1 text-slate-300">
                  {explanation.missingRequirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* DOCUMENT READINESS CHECKLIST */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Document Vault Readiness</h2>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {readinessLabel}
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${readinessPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Available Documents */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              ✅ Documents Available in Vault ({availableDocuments.length})
            </h4>
            {availableDocuments.length > 0 ? (
              <ul className="space-y-1 text-xs text-emerald-800">
                {availableDocuments.map((doc, i) => (
                  <li key={i} className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-700">No documents ready yet.</p>
            )}
          </div>

          {/* Missing Documents */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              ❌ Documents Missing ({missingDocuments.length})
            </h4>
            {missingDocuments.length > 0 ? (
              <ul className="space-y-1 text-xs text-rose-800">
                {missingDocuments.map((doc, i) => (
                  <li key={i} className="flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-700 font-bold">All required documents are ready!</p>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            <FolderLock className="w-4 h-4" />
            <span>Open Document Vault to Upload</span>
          </Link>
        </div>
      </div>

      {/* BENEFITS & APPLICATION STEPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Benefits List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Stated Scheme Benefits</h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {(language === 'te' ? scheme.teluguBenefits : scheme.benefits).map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Application Steps & Source */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Application Steps</h3>
          <ol className="space-y-2 text-xs text-slate-700 list-decimal list-inside">
            {scheme.applicationSteps.map((step, i) => (
              <li key={i} className="leading-relaxed">
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Official Portal:</span>
            <a
              href={scheme.officialSource}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
            >
              <span>Visit Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Application Deadline: <strong>{scheme.deadline ? scheme.deadline : 'Rolling Window'}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSetReminder}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span>{reminderSet ? 'Reminder Scheduled!' : 'Set Deadline Reminder'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
