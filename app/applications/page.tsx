'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { schemeStore } from '@/lib/storage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  FileText, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  ExternalLink,
  ShieldAlert,
  Loader2,
  Trash2
} from 'lucide-react';

export interface CitizenApplicationRecord {
  id: string;
  userId: string;
  schemeId: string;
  schemeName: string;
  applicationNumber: string;
  appliedDate: string;
  status: 'PLANNING' | 'DOCUMENTS_PENDING' | 'READY_TO_APPLY' | 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  notes: string;
  nextAction: string;
  updatedAt: string;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  
  const [applications, setApplications] = useState<CitizenApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [schemeId, setSchemeId] = useState('scheme_001');
  const [appNum, setAppNum] = useState('');
  const [status, setStatus] = useState<CitizenApplicationRecord['status']>('APPLIED');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');

  useEffect(() => {
    loadApplications();
  }, [user]);

  const loadApplications = () => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jan_setu_applications');
      if (stored) {
        setApplications(JSON.parse(stored));
      } else {
        setApplications([]);
      }
    }
    setIsLoading(false);
  };

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const scheme = schemeStore.getSchemeById(schemeId);
    if (!scheme) return;

    const newApp: CitizenApplicationRecord = {
      id: `app_${Date.now()}`,
      userId: user?.uid || 'guest_user',
      schemeId: scheme.schemeId,
      schemeName: scheme.name,
      applicationNumber: appNum || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      appliedDate,
      status,
      notes,
      nextAction,
      updatedAt: new Date().toISOString(),
    };

    const updated = [newApp, ...applications];
    setApplications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jan_setu_applications', JSON.stringify(updated));
    }

    setAppNum('');
    setNotes('');
    setNextAction('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this application tracking entry?')) {
      const updated = applications.filter(a => a.id !== id);
      setApplications(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('jan_setu_applications', JSON.stringify(updated));
      }
    }
  };

  const schemes = schemeStore.getAllSchemes();

  const getStatusBadge = (st: CitizenApplicationRecord['status']) => {
    switch (st) {
      case 'APPROVED':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> {st}</span>;
      case 'UNDER_REVIEW':
      case 'APPLIED':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-300 flex items-center gap-1"><Clock className="w-3 h-3 text-blue-600" /> {st.replace('_', ' ')}</span>;
      case 'DOCUMENTS_PENDING':
      case 'PLANNING':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300 flex items-center gap-1"><AlertCircle className="w-3 h-3 text-amber-600" /> {st.replace('_', ' ')}</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300 flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-600" /> REJECTED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{st}</span>;
    }
  };

  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <div className="space-y-8 py-2">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>My Application Progress Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manually record and organize your government scheme submissions, reference numbers, and follow-up actions.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
          {applications.length} Applications Recorded
        </span>
      </div>

      {/* DISCLAIMER BANNER */}
      <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Citizen Notice:</strong> Jan-Setu provides personal progress logging. Official government application processing and disbursement decisions are managed independently by the respective ministry/department portals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Record Application Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Record New Scheme Application</span>
          </h3>

          <form onSubmit={handleAddApplication} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Government Scheme *</label>
              <select
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium text-slate-900"
              >
                {schemes.map(s => (
                  <option key={s.schemeId} value={s.schemeId}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Application / Reference Number</label>
              <input
                type="text"
                value={appNum}
                onChange={(e) => setAppNum(e.target.value)}
                placeholder="e.g. Application or Acknowledgment Number"
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Current Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium text-slate-900"
              >
                <option value="PLANNING">Planning & Gathering Info</option>
                <option value="DOCUMENTS_PENDING">Documents Pending</option>
                <option value="READY_TO_APPLY">Ready to Apply</option>
                <option value="APPLIED">Applied on Official Portal</option>
                <option value="UNDER_REVIEW">Under Government Review</option>
                <option value="APPROVED">Approved / Sanctioned</option>
                <option value="REJECTED">Rejected / Clarification Sought</option>
                <option value="COMPLETED">Completed & Funds Disbursed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Application Date *</label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Notes / Submission Channel</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Submitted via Meeseva center Nalgonda"
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Next Action Step</label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g. Check bank credit next week"
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Application Entry</span>
            </button>
          </form>
        </div>

        {/* Applications List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Recorded Applications Log</h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500 mt-2">Loading application tracker...</p>
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map(app => (
                <div
                  key={app.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{app.schemeName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Ref No: <span className="font-bold text-slate-700">{app.applicationNumber}</span> • Applied: {app.appliedDate}
                      </p>
                    </div>

                    {getStatusBadge(app.status)}
                  </div>

                  {app.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Notes:</strong> {app.notes}
                    </p>
                  )}

                  {app.nextAction && (
                    <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                      <span className="font-bold">Next Step:</span>
                      <span>{app.nextAction}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>Last updated: {new Date(app.updatedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Applications Logged</h3>
              <p className="text-xs text-slate-500">
                Use the form on the left to track application reference numbers and follow-up steps.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
