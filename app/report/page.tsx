'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { profileStore, schemeStore, documentStore, CitizenProfile, EligibilityResult } from '@/lib/storage';
import { evaluateAllSchemes } from '@/lib/eligibility/engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Printer, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, Calendar, FileText } from 'lucide-react';

export default function ReadinessReportPage() {
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [results, setResults] = useState<EligibilityResult[]>([]);

  useEffect(() => {
    const current = profileStore.getProfile();
    const schemes = schemeStore.getAllSchemes();
    const docs = documentStore.getDocuments();

    setProfile(current);
    setResults(evaluateAllSchemes(current, schemes, docs));
  }, []);

  if (!profile) return null;

  const matched = results.filter(r => r.matchStatus === 'MATCHED' || r.matchStatus === 'PARTIAL_MATCH');

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 py-4 max-w-4xl mx-auto">
      
      {/* Action Header bar (Hidden in print view) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between no-print">
        <Link href="/csc" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CSC Center</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF Report</span>
        </button>
      </div>

      {/* PRINTABLE REPORT DOCUMENT BODY */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-300 shadow-md space-y-8 text-slate-900 print:shadow-none print:border-none print:p-0">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
              <img 
                src="/images/logo.png" 
                alt="Jan-Setu Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Jan-Setu</h1>
              <p className="text-xs font-semibold text-slate-600">Application Readiness & Scheme Discovery Report</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span className="block font-bold text-slate-900">Report Date: {new Date().toLocaleDateString()}</span>
            <span>Informational Assistance Summary</span>
          </div>
        </div>

        {/* CITIZEN PROFILE SUMMARY BOX */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 p-2 rounded-md">
            1. Citizen Profile Assessment Summary
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-xl text-xs bg-slate-50/50">
            <div>
              <span className="text-slate-500 font-medium block">Full Name:</span>
              <strong className="text-slate-900 text-sm">{profile.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Age & Gender:</span>
              <strong className="text-slate-900">{profile.age} Years ({profile.gender})</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">State & Rural Status:</span>
              <strong className="text-slate-900">{profile.state} ({profile.isRural ? 'Rural' : 'Urban'})</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Occupation & Income:</span>
              <strong className="text-slate-900">{profile.occupation.replace(/_/g, ' ')} (₹{profile.annualIncome.toLocaleString('en-IN')})</strong>
            </div>
          </div>
        </div>

        {/* MATCHED SCHEMES & DOCUMENT READINESS LIST */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 p-2 rounded-md">
            2. Matched Schemes & Required Document Checklist
          </h2>

          <div className="space-y-4">
            {matched.map((res, index) => (
              <div key={res.schemeId} className="border border-slate-300 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scheme #{index + 1}</span>
                    <h3 className="text-base font-bold text-slate-900">{res.scheme.name}</h3>
                    <span className="text-xs text-slate-600 font-medium">{res.scheme.sector} Sector • {res.scheme.officialSource}</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    res.matchStatus === 'MATCHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {res.statusLabel} ({res.readinessLabel})
                  </span>
                </div>

                {/* Benefits */}
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold block mb-1">Key Benefits:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {res.scheme.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>

                {/* Required Docs Checkbox List */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="font-bold text-emerald-800 block mb-1">✅ Available Documents:</span>
                    {res.availableDocuments.length > 0 ? (
                      <ul className="space-y-1 text-slate-800">
                        {res.availableDocuments.map((d, i) => (
                          <li key={i} className="flex items-center gap-1.5 font-medium">
                            <span className="text-emerald-600 font-bold">✓</span> {d}
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-slate-500">None ready</span>}
                  </div>

                  <div>
                    <span className="font-bold text-rose-800 block mb-1">❌ Missing Documents:</span>
                    {res.missingDocuments.length > 0 ? (
                      <ul className="space-y-1 text-slate-800">
                        {res.missingDocuments.map((d, i) => (
                          <li key={i} className="flex items-center gap-1.5 font-medium">
                            <span className="text-rose-600 font-bold">✗</span> {d}
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-emerald-700 font-bold">All Ready!</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STATUTORY DISCLAIMER FOOTER */}
        <div className="border-t-2 border-slate-300 pt-4 space-y-2 text-[11px] text-slate-600">
          <p className="font-bold text-slate-800">
            Notice & Statutory Disclaimer:
          </p>
          <p className="leading-relaxed">
            Jan-Setu is an informational assistance platform and is NOT a government authority. This Application Readiness Report does NOT constitute an official government approval or guarantee of benefit disbursement. Final eligibility evaluation and approval are strictly determined by the relevant government departments and official authorities.
          </p>
        </div>

      </div>

    </div>
  );
}
