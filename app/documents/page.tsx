'use client';

import React, { useState, useEffect } from 'react';
import { documentStore, VaultDocument, INITIAL_VAULT_DOCUMENTS } from '@/lib/storage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
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
  Plus
} from 'lucide-react';

export default function DocumentsPage() {
  const { language, t } = useLanguage();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploading, setIsUploading] = useState(false);

  // Form states for manual file upload demo
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Aadhaar Card');

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = () => {
    const list = documentStore.getDocuments();
    setDocuments(list);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      documentStore.addDocument({
        userId: 'citizen_demo_01',
        fileName: `${docName.replace(/\s+/g, '_')}.pdf`,
        documentType: docType,
        fileUrl: '#',
        fileSize: Math.floor(Math.random() * 500 + 200) * 1024,
        status: 'Uploaded',
        associatedSchemeIds: [],
      });
      setDocName('');
      setIsUploading(false);
      loadDocs();
    }, 600);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document from your vault?')) {
      documentStore.deleteDocument(id);
      loadDocs();
    }
  };

  const categories = ['All', 'Identity', 'Income', 'Residence', 'Education', 'Agriculture', 'Other'];

  const filteredDocs = documents.filter(doc => {
    if (selectedCategory === 'All') return true;
    const dt = doc.documentType.toLowerCase();
    if (selectedCategory === 'Identity' && (dt.includes('aadhaar') || dt.includes('pan') || dt.includes('voter'))) return true;
    if (selectedCategory === 'Income' && (dt.includes('income') || dt.includes('salary'))) return true;
    if (selectedCategory === 'Residence' && (dt.includes('residence') || dt.includes('ration') || dt.includes('domicile'))) return true;
    if (selectedCategory === 'Education' && (dt.includes('ssc') || dt.includes('degree') || dt.includes('bonafide'))) return true;
    if (selectedCategory === 'Agriculture' && (dt.includes('pattadar') || dt.includes('land') || dt.includes('passbook'))) return true;
    if (selectedCategory === 'Other') return true;
    return false;
  });

  return (
    <div className="space-y-8 py-2">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-blue-600" />
            <span>My Documents (Citizen Document Vault)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Store and manage your personal documents securely. Automatically cross-referenced for scheme application readiness.
          </p>
        </div>

        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>{documents.length} Files Stored</span>
        </span>
      </div>

      {/* PRIVACY NOTICE BANNER */}
      <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 flex items-start gap-3 shadow-xs">
        <Lock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy Notice:</strong> Your documents are stored for application-readiness purposes. Jan-Setu does not verify government document authenticity. Production deployment utilizes encrypted cloud storage with strict access controls.
        </p>
      </div>

      {/* UPLOAD FORM & FILTER BAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Upload New Document</span>
          </h3>

          <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Document Name</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Income Certificate 2026"
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Document Category / Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Income Certificate">Income Certificate</option>
                <option value="Caste Certificate">Caste Certificate</option>
                <option value="Residence Certificate">Residence Certificate</option>
                <option value="Bank Passbook">Bank Passbook</option>
                <option value="Pattadar Passbook / Land Record">Pattadar Passbook / Land Record</option>
                <option value="Ration Card / Food Security Card">Ration Card / Food Security Card</option>
                <option value="Disability Certificate">Disability Certificate</option>
                <option value="Education Certificate">Education Certificate</option>
                <option value="Other">Other Document</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl text-center space-y-2 hover:border-blue-400 transition-colors bg-slate-50/50">
              <FileText className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-[11px] text-slate-500 font-medium">Drag & drop or select PDF / Image</p>
              <span className="text-[10px] text-slate-400 block">Max size: 5 MB (PDF, PNG, JPG)</span>
            </div>

            <button
              type="submit"
              disabled={isUploading || !docName.trim()}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isUploading ? 'Uploading to Vault...' : 'Add to Vault'}</span>
            </button>
          </form>
        </div>

        {/* Document List & Filters */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Category Filter Buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 border-b border-slate-200">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Document Cards List */}
          {filteredDocs.length > 0 ? (
            <div className="space-y-3">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{doc.documentType}</span>
                        <span>•</span>
                        <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{doc.status}</span>
                    </span>

                    <button
                      onClick={() => alert(`Simulated document preview for ${doc.fileName}`)}
                      className="p-2 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg text-xs font-bold"
                      title="View Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => alert(`Downloading ${doc.fileName}`)}
                      className="p-2 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg text-xs font-bold"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id)}
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
              <h3 className="text-sm font-bold text-slate-800">Your Document Vault is Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your identity, income, or land documents using the form on the left to simplify scheme preparation.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
