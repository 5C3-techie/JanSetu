'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { profileStore, schemeStore, documentStore, CitizenProfile, EligibilityResult } from '@/lib/storage';
import { evaluateAllSchemes } from '@/lib/eligibility/engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Building2, Printer, Search, Plus, UserCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function CSCModePage() {
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

  const matched = results.filter(r => r.matchStatus === 'MATCHED');
  const partial = results.filter(r => r.matchStatus === 'PARTIAL_MATCH');

  return (
    <div className="space-y-8 py-2">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-900">CSC / VLE Operator Assistance Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Common Service Centre workflow for operator intake, scheme readiness verification, and printable citizen reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/report"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Printable Readiness Report</span>
          </Link>
        </div>
      </div>

      {/* QUICK INTAKE ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900">Start New Citizen Assessment</h3>
          <p className="text-xs text-slate-500">Quickly enter a new citizen's profile details or speak via voice intake.</p>
          <Link href="/profile" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline pt-2">
            <span>Open Profile Intake</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900">Verify Document Readiness</h3>
          <p className="text-xs text-slate-500">Cross-reference citizen vault documents against scheme requirements.</p>
          <Link href="/documents" className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline pt-2">
            <span>Manage Document Vault</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900">Issue Official Checklist</h3>
          <p className="text-xs text-slate-500">Print or export a clean, non-governmental Application Readiness Summary.</p>
          <Link href="/report" className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline pt-2">
            <span>View Printable Checklist</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ACTIVE CITIZEN SUMMARY SHEET */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Active Assessment Roster Summary</h2>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {matched.length} Likely Matches Identified
          </span>
        </div>

        {/* Citizen Profile Data Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Citizen Name:</span>
            <strong className="text-slate-800">{profile.name}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Age & Gender:</span>
            <strong className="text-slate-800">{profile.age} yrs ({profile.gender})</strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Occupation & Location:</span>
            <strong className="text-slate-800">{profile.occupation.replace(/_/g, ' ')}, {profile.state}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Annual Income:</span>
            <strong className="text-slate-800">₹{profile.annualIncome.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Matched Schemes Checklist Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Assessed Scheme Matches & Document Readiness
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="p-3">Scheme Name</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Match Status</th>
                  <th className="p-3">Readiness</th>
                  <th className="p-3">Missing Documents</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {[...matched, ...partial].map(res => (
                  <tr key={res.schemeId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{res.scheme.name}</td>
                    <td className="p-3">{res.scheme.sector}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        res.matchStatus === 'MATCHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {res.matchStatus === 'MATCHED' ? 'Likely Match' : 'Needs Verification'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-blue-700">{res.readinessLabel}</td>
                    <td className="p-3 text-rose-700">
                      {res.missingDocuments.length > 0 ? res.missingDocuments.join(', ') : '✅ None'}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/schemes/${res.schemeId}`}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
