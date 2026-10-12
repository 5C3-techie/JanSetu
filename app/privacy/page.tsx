'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getUnifiedProfile, 
  getUnifiedDocuments, 
  getUnifiedReminders, 
  profileStore, 
  documentStore, 
  reminderStore,
  deleteDocumentFromVault,
  firebaseProfileStore
} from '@/lib/storage';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  Download, 
  AlertTriangle, 
  UserX, 
  CheckCircle2,
  FileText,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function PrivacyPage() {
  const { user, logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleExportData = async () => {
    const profile = await getUnifiedProfile(user?.uid);
    const docs = await getUnifiedDocuments(user?.uid);
    const rems = await getUnifiedReminders(user?.uid);

    const exportBundle = {
      user: {
        uid: user?.uid || 'guest_user',
        email: user?.email || 'guest@jansetu.in',
      },
      exportedAt: new Date().toISOString(),
      profile,
      documents: docs.map(d => ({ ...d, fileUrl: '[PROTECTED_PRIVATE_URL]' })),
      reminders: rems,
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jan-Setu_Citizen_Data_${user?.uid || 'guest'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllData = async () => {
    if (!confirm('CAUTION: Are you sure you want to permanently delete all your profile details, document vault metadata, and reminders? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      if (user) {
        // Delete all documents from vault
        const docs = await getUnifiedDocuments(user.uid);
        for (const docItem of docs) {
          await deleteDocumentFromVault(user.uid, docItem);
        }
        // Delete profile
        await firebaseProfileStore.saveProfile(user.uid, {
          id: user.uid,
          name: '',
          age: 0,
          gender: 'all',
          state: 'Telangana',
          district: '',
          isRural: true,
          occupation: '',
          annualIncome: 0,
          landOwnership: false,
          category: 'All',
          hasAadhaar: false,
          hasIncomeCert: false,
          hasCasteCert: false,
          hasLandDoc: false,
          hasBankPassbook: false,
          hasRationCard: false,
          hasDisabilityCert: false,
        });
      }

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jan_setu_profile');
        localStorage.removeItem('jan_setu_documents');
        localStorage.removeItem('jan_setu_reminders');
      }

      setStatusMsg('All your profile details and document vault data have been erased successfully.');
    } catch (err: any) {
      console.error(err);
      setStatusMsg('An error occurred while deleting data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('CRITICAL: Deleting your account will remove your Firebase credentials and erase all associated citizen data. Continue?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await handleDeleteAllData();
      if (user) {
        await user.delete();
      }
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      console.error(err);
      setStatusMsg(err.message || 'Could not delete account. Re-authentication may be required.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            <span>Privacy Policy & Citizen Data Controls</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Jan-Setu operates under strict data minimization, user privacy protection, and complete user ownership.
          </p>
        </div>
      </div>

      {/* PRIVACY PRINCIPLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700" />
            <span>Data Minimization & Confidentiality</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We collect only attributes required for deterministic scheme eligibility matching. We do not sell, share, or monetize citizen data.
          </p>
          <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc pl-4">
            <li>Private document storage path (<code className="text-slate-700">users/{'{uid}'}/documents</code>).</li>
            <li>No binary documents or government IDs are sent to AI models (Gemini).</li>
            <li>No public disclosure of citizen income or caste records.</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-700" />
            <span>Official Government Source Disclaimer</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Jan-Setu is an independent discovery portal and deterministic eligibility engine. Final scheme sanctions rest strictly with official government ministries and departments.
          </p>
          <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc pl-4">
            <li>Every scheme provides verified official portal links (<code className="text-slate-700">myScheme.gov.in</code>).</li>
            <li>No fake deadlines or fictional schemes are generated.</li>
          </ul>
        </div>

      </div>

      {/* USER DATA MANAGEMENT CONTROLS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Citizen Rights & Data Deletion Panel
        </h2>

        {statusMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Export Data */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Export My Data</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Download a full JSON copy of your profile attributes, vault metadata, and reminders.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all text-xs"
            >
              Export JSON
            </button>
          </div>

          {/* Delete All Data */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-amber-700" />
                <span>Purge Vault & Profile</span>
              </h4>
              <p className="text-[11px] text-amber-800 mt-1">
                Erase your profile information and remove all files uploaded to your Document Vault.
              </p>
            </div>
            <button
              onClick={handleDeleteAllData}
              disabled={isDeleting}
              className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all text-xs disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Erase Vault Data'}
            </button>
          </div>

          {/* Delete Account */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-rose-700" />
                <span>Delete Account</span>
              </h4>
              <p className="text-[11px] text-rose-800 mt-1">
                Permanently close your Jan-Setu account and purge all records from Firebase authentication & Firestore.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting || !user}
              className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all text-xs disabled:opacity-50"
            >
              {isDeleting ? 'Processing...' : user ? 'Delete Account' : 'Requires Login'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
