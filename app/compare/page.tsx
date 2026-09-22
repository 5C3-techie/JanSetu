'use client';

import React, { useState, useEffect } from 'react';
import { schemeStore, Scheme } from '@/lib/storage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { GitCompare, ExternalLink, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function CompareSchemesPage() {
  const { language, t } = useLanguage();
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['scheme_001', 'scheme_002', 'scheme_003']);

  useEffect(() => {
    setAllSchemes(schemeStore.getAllSchemes());
  }, []);

  const handleSelectScheme = (index: number, id: string) => {
    const updated = [...selectedIds];
    updated[index] = id;
    setSelectedIds(updated);
  };

  const selectedSchemes = selectedIds.map(id => allSchemes.find(s => s.schemeId === id)).filter(Boolean) as Scheme[];

  return (
    <div className="space-y-6 py-2">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-blue-600" />
            <span>Side-by-Side Scheme Comparison</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare up to 3 welfare schemes to understand differences in eligibility, benefit structure, and document requirements.
          </p>
        </div>

        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
          Neutral Side-by-Side Analysis
        </span>
      </div>

      {/* SCHEME SELECTOR ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((colIndex) => (
          <div key={colIndex} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Scheme #{colIndex + 1}
            </label>
            <select
              value={selectedIds[colIndex] || ''}
              onChange={(e) => handleSelectScheme(colIndex, e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              {allSchemes.map(s => (
                <option key={s.schemeId} value={s.schemeId}>
                  {s.name} ({s.sector})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* COMPARISON TABLE */}
      {selectedSchemes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4 w-44">Feature</th>
                  {selectedSchemes.map((s, idx) => (
                    <th key={idx} className="p-4 min-w-[240px] text-blue-900 bg-blue-50/40">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Sector */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Sector</td>
                  {selectedSchemes.map((s, idx) => (
                    <td key={idx} className="p-4 font-medium text-slate-700">
                      <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 font-bold">
                        {s.sector}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* State Applicability */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/50">State Applicability</td>
                  {selectedSchemes.map((s, idx) => (
                    <td key={idx} className="p-4 font-medium text-slate-700">
                      {s.eligibility.states.join(', ')}
                    </td>
                  ))}
                </tr>

                {/* Key Benefits */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Stated Benefits</td>
                  {selectedSchemes.map((s, idx) => (
                    <td key={idx} className="p-4 space-y-1">
                      {s.benefits.map((b, i) => (
                        <p key={i} className="flex items-start gap-1.5 text-slate-800">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{b}</span>
                        </p>
                      ))}
                    </td>
                  ))}
                </tr>

                {/* Income Limit */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Max Annual Income</td>
                  {selectedSchemes.map((s, idx) => (
                    <td key={idx} className="p-4 font-bold text-slate-800">
                      {s.eligibility.incomeMax 
                        ? `₹${s.eligibility.incomeMax.toLocaleString('en-IN')}` 
                        : 'No explicit income limit'}
                    </td>
                  ))}
                </tr>

                {/* Required Documents */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Required Documents</td>
                  {selectedSchemes.map((s, idx) => (
                    <td key={idx} className="p-4 space-y-1">
                      {s.requiredDocuments.map((doc, i) => (
                        <p key={i} className="flex items-center gap-1.5 text-slate-700">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc}</span>
                        </p>
                      ))}
                    </td>
                  ))}
                </tr>

                {/* Application Deadline */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Deadline Type</td>
                  {selectedSchemes.map((s, idx) => (
                    <td key={idx} className="p-4 font-medium text-slate-800">
                      <span className="capitalize">{s.deadlineType.replace(/_/g, ' ')}</span>
                      {s.deadline && <span className="block text-purple-700 font-bold">Target: {s.deadline}</span>}
                    </td>
                  ))}
                </tr>

                {/* Official Source */}
                <tr>
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Official Source</td>
                  {selectedSchemes.map((s, idx) => (
                    <td key={idx} className="p-4">
                      <a
                        href={s.officialSource}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
