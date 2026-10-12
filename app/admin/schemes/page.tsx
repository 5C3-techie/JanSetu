'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { schemeStore, Scheme } from '@/lib/storage';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Edit3, 
  Search, 
  RefreshCw,
  Lock,
  Layers,
  FileText
} from 'lucide-react';

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  
  // Verification form edit state
  const [verifiedBy, setVerifiedBy] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [statusInput, setStatusInput] = useState<'verified' | 'needs_verification'>('verified');

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = () => {
    setSchemes(schemeStore.getAllSchemes());
  };

  const startEditing = (s: Scheme) => {
    setEditingSchemeId(s.schemeId);
    setVerifiedBy(s.verifiedBy || 'Jan-Setu Compliance Admin');
    setVerificationNotes(s.verificationNotes || 'Verified against official ministry notification.');
    setStatusInput(s.verificationStatus || 'verified');
  };

  const handleSaveVerification = (schemeId: string) => {
    const target = schemes.find(s => s.schemeId === schemeId);
    if (!target) return;

    target.verificationStatus = statusInput;
    target.verifiedBy = verifiedBy;
    target.verificationNotes = verificationNotes;
    target.lastVerified = new Date().toISOString().split('T')[0];

    setEditingSchemeId(null);
    setSchemes([...schemes]);
  };

  const verifiedCount = schemes.filter(s => s.verificationStatus === 'verified').length;
  const needsVerifCount = schemes.filter(s => s.verificationStatus === 'needs_verification').length;

  const filtered = schemes.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || s.verificationStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 py-2">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Admin Scheme Verification Portal</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Controlled Admin Area</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit, verify, and validate official government scheme data sources, guidelines, and eligibility rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            {verifiedCount} Verified / {schemes.length} Total
          </span>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-bold uppercase tracking-wider block">Total Catalogue Schemes</span>
          <span className="text-2xl font-extrabold text-slate-900 block">{schemes.length}</span>
          <span className="text-[11px] text-slate-400">Indexed in Knowledge Base</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-xs space-y-1">
          <span className="text-emerald-800 font-bold uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Schemes
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 block">{verifiedCount}</span>
          <span className="text-[11px] text-emerald-700">Audit Status: PASS</span>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs space-y-1">
          <span className="text-amber-800 font-bold uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Needs Review / Unverified
          </span>
          <span className="text-2xl font-extrabold text-amber-700 block">{needsVerifCount}</span>
          <span className="text-[11px] text-amber-700">Requires Manual Compliance Review</span>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scheme title, ministry, or sector..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStatus('All')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedStatus === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({schemes.length})
          </button>
          <button
            onClick={() => setSelectedStatus('verified')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedStatus === 'verified' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setSelectedStatus('needs_verification')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedStatus === 'needs_verification' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Needs Review ({needsVerifCount})
          </button>
        </div>
      </div>

      {/* SCHEMES TABLE / LIST */}
      <div className="space-y-4">
        {filtered.map(s => {
          const isEditing = editingSchemeId === s.schemeId;
          const officialUrl = s.officialSourceUrl || s.officialSource || s.applicationUrl;

          return (
            <div
              key={s.schemeId}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {s.sector}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {s.ministry || 'Ministry of Agriculture'} • Level: {s.level || 'State/Central'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    s.verificationStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {s.verificationStatus === 'verified' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-amber-600" />}
                    <span>{s.verificationStatus === 'verified' ? 'VERIFIED' : 'NEEDS REVIEW'}</span>
                  </span>

                  <button
                    onClick={() => startEditing(s)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Audit / Edit</span>
                  </button>
                </div>
              </div>

              {/* Verification Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Official Source URL</span>
                  <a href={officialUrl} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline flex items-center gap-1 truncate mt-0.5">
                    <span className="truncate">{officialUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Last Verified Date</span>
                  <span className="font-semibold text-slate-800">{s.lastVerified}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Audited By</span>
                  <span className="font-semibold text-slate-800">{s.verifiedBy || 'Jan-Setu Data Verification Team'}</span>
                </div>
              </div>

              {/* Edit Modal / Form Box if editing */}
              {isEditing && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3 text-xs animate-fadeIn">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Update Verification Record for "{s.name}"</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Verification Status</label>
                      <select
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value as any)}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-white font-medium outline-none"
                      >
                        <option value="verified">Verified Official</option>
                        <option value="needs_verification">Needs Verification / Review</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Verified By (Auditor)</label>
                      <input
                        type="text"
                        value={verifiedBy}
                        onChange={(e) => setVerifiedBy(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-white font-medium outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Verification Notes</label>
                      <input
                        type="text"
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-white font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingSchemeId(null)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveVerification(s.schemeId)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs"
                    >
                      Save Verification Audit
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
