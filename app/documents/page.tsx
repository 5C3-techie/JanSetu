'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getUnifiedDocuments, 
  uploadDocumentToVault, 
  deleteDocumentFromVault, 
  SUPPORTED_DOCUMENT_TYPES,
  VaultDocument, 
  documentStore 
} from '@/lib/storage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  FolderLock, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Download, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Plus,
  Loader2,
  ShieldAlert
} from 'lucide-react';

export default function DocumentsPage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('Aadhaar Card');

  useEffect(() => {
    loadDocs();
  }, [user]);

  const loadDocs = async () => {
    setIsLoadingDocs(true);
    try {
      const list = await getUnifiedDocuments(user?.uid);
      setDocuments(list);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFile) {
      setErrorMsg('Please select a document file to upload.');
      return;
    }

    setIsUploading(true);

    try {
      if (user) {
        // Upload to real user-scoped Firebase Storage + Firestore metadata
        await uploadDocumentToVault(user.uid, selectedFile, docType);
      } else {
        // Fallback local state upload for guest/demo mode
        documentStore.addDocument({
          userId: 'guest_citizen',
          fileName: selectedFile.name,
          documentType: docType,
          fileUrl: URL.createObjectURL(selectedFile),
          fileSize: selectedFile.size,
          status: 'Uploaded',
          associatedSchemeIds: [],
        });
      }

      setSuccessMsg(`Successfully uploaded "${selectedFile.name}" to your Document Vault.`);
      setSelectedFile(null);
      await loadDocs();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to upload document to vault.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docItem: VaultDocument) => {
    if (confirm(`Are you sure you want to delete "${docItem.fileName}" from your private document vault?`)) {
      try {
        if (user) {
          await deleteDocumentFromVault(user.uid, docItem);
        } else {
          documentStore.deleteDocument(docItem.id);
        }
        setSuccessMsg(`Document "${docItem.fileName}" deleted.`);
        await loadDocs();
      } catch (err: any) {
        console.error('Failed to delete document:', err);
        setErrorMsg('Could not delete document.');
      }
    }
  };

  const categoryFilters = ['All', 'Identity', 'Income & Financial', 'Residence & Land', 'Education & Other'];

  const filteredDocs = documents.filter(doc => {
    if (selectedCategory === 'All') return true;
    const dt = doc.documentType.toLowerCase();
    if (selectedCategory === 'Identity' && (dt.includes('aadhaar') || dt.includes('pan') || dt.includes('voter') || dt.includes('passport') || dt.includes('licence') || dt.includes('photograph') || dt.includes('id'))) return true;
    if (selectedCategory === 'Income & Financial' && (dt.includes('income') || dt.includes('bank') || dt.includes('passbook'))) return true;
    if (selectedCategory === 'Residence & Land' && (dt.includes('residence') || dt.includes('domicile') || dt.includes('ration') || dt.includes('land') || dt.includes('pattadar'))) return true;
    if (selectedCategory === 'Education & Other') return true;
    return false;
  });

  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <div className="space-y-8 py-2">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-emerald-700" />
            <span>My Document Vault</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user 
              ? `Authenticated Private Vault (${user.email}) — User-scoped Firebase Storage` 
              : 'Guest Mode — sign in to upload files to cloud storage securely'}
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>{documents.length} Secure Vault Files</span>
        </span>
      </div>

      {/* PRIVACY & SECURITY BANNER */}
      <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Strict Citizen Document Security & Privacy Guarantee</p>
          <p className="leading-relaxed text-[11px] text-emerald-800">
            Documents are stored in a private user path (<code className="bg-emerald-100 px-1 py-0.5 rounded">users/{'{uid}'}/documents</code>). Unauthenticated users or other citizens cannot access your files. Jan-Setu does NOT send document contents or images to Gemini AI.
          </p>
        </div>
      </div>

      {/* UPLOAD FORM & FILE LIST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <UploadCloud className="w-4 h-4 text-emerald-700" />
            <span>Upload Document to Vault</span>
          </h3>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Select Document Type *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium text-slate-900"
              >
                {SUPPORTED_DOCUMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Choose File (PDF, PNG, JPG, WEBP) *</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800"
                required
              />
              <span className="text-[10px] text-slate-400 block pt-0.5">Maximum file size: 10 MB</span>
            </div>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Private Vault...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Document List & Filters */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Category Filter Buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 border-b border-slate-200">
            {categoryFilters.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Document Cards List */}
          {isLoadingDocs ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500 mt-2">Loading document vault...</p>
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="space-y-3">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-emerald-800">{doc.documentType}</span>
                        <span>•</span>
                        <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{doc.status}</span>
                    </span>

                    {doc.fileUrl && doc.fileUrl !== '#' && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg text-xs font-bold"
                        title="View / Download Document"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <FolderLock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Vault File Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your identity, income, or land documents to evaluate scheme application readiness automatically.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
