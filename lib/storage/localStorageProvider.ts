import { CitizenProfile, VaultDocument, DeadlineReminder, Scheme } from './types';
import rawSchemes from '@/data/schemes.json';

export const DEMO_CITIZEN_PROFILE: CitizenProfile = {
  id: 'citizen_demo_01',
  name: 'Ramesh Kumar (Demo)',
  age: 42,
  gender: 'male',
  state: 'Telangana',
  district: 'Nalgonda',
  isRural: true,
  occupation: 'agricultural_labourer',
  annualIncome: 120000,
  landOwnership: false,
  category: 'BC',
  hasAadhaar: true,
  hasIncomeCert: false,
  hasCasteCert: false,
  hasLandDoc: false,
  hasBankPassbook: true,
  hasRationCard: true,
  hasDisabilityCert: false,
  rawInputText: 'I am a 42 year old agricultural labourer from a village in Telangana. My annual income is around 1.2 lakh and I don\'t own land.',
};

export const INITIAL_VAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc_001',
    userId: 'citizen_demo_01',
    fileName: 'Aadhaar_Card_Ramesh.pdf',
    documentType: 'Aadhaar Card',
    fileUrl: '#',
    fileSize: 1024 * 450, // 450 KB
    uploadedAt: '2026-09-01T10:30:00Z',
    status: 'Uploaded',
    associatedSchemeIds: ['scheme_001', 'scheme_002', 'scheme_003', 'scheme_004'],
  },
  {
    id: 'doc_002',
    userId: 'citizen_demo_01',
    fileName: 'Bank_Passbook_SBI.pdf',
    documentType: 'Bank Passbook',
    fileUrl: '#',
    fileSize: 1024 * 680, // 680 KB
    uploadedAt: '2026-09-05T14:15:00Z',
    status: 'Uploaded',
    associatedSchemeIds: ['scheme_001', 'scheme_002', 'scheme_006'],
  },
  {
    id: 'doc_003',
    userId: 'citizen_demo_01',
    fileName: 'Food_Security_Ration_Card.pdf',
    documentType: 'Ration Card / Food Security Card',
    fileUrl: '#',
    fileSize: 1024 * 320, // 320 KB
    uploadedAt: '2026-09-10T11:00:00Z',
    status: 'Uploaded',
    associatedSchemeIds: ['scheme_004', 'scheme_005', 'scheme_009'],
  }
];

export const INITIAL_REMINDERS: DeadlineReminder[] = [
  {
    id: 'rem_001',
    userId: 'citizen_demo_01',
    schemeId: 'scheme_001',
    schemeName: 'Rythu Bharosa / Rythu Bandhu Scheme',
    deadline: '2026-10-31',
    reminderDate: '2026-10-24',
    reminderType: '7_days_before',
    status: 'active',
    notes: 'Check status of seasonal Kharif investment assistance credit',
    createdAt: '2026-09-15T08:00:00Z',
  },
  {
    id: 'rem_002',
    userId: 'citizen_demo_01',
    schemeId: 'scheme_006',
    schemeName: 'Telangana Aasara Pension Scheme',
    deadline: '2026-11-15',
    reminderDate: '2026-10-16',
    reminderType: '30_days_before',
    status: 'active',
    notes: 'Submit Income Certificate renewal at Meeseva center',
    createdAt: '2026-09-18T09:30:00Z',
  }
];

// Helper for client-side local storage fallback
const isClient = typeof window !== 'undefined';

export const profileStore = {
  getProfile: (): CitizenProfile => {
    if (!isClient) return DEMO_CITIZEN_PROFILE;
    const stored = localStorage.getItem('jan_setu_profile');
    return stored ? JSON.parse(stored) : DEMO_CITIZEN_PROFILE;
  },
  saveProfile: (profile: CitizenProfile): void => {
    if (isClient) {
      localStorage.setItem('jan_setu_profile', JSON.stringify(profile));
    }
  },
  resetProfileToDemo: (): CitizenProfile => {
    if (isClient) {
      localStorage.setItem('jan_setu_profile', JSON.stringify(DEMO_CITIZEN_PROFILE));
    }
    return DEMO_CITIZEN_PROFILE;
  }
};

export const schemeStore = {
  getAllSchemes: (): Scheme[] => {
    return rawSchemes as Scheme[];
  },
  getSchemeById: (id: string): Scheme | undefined => {
    return (rawSchemes as Scheme[]).find(s => s.schemeId === id);
  }
};

export const documentStore = {
  getDocuments: (): VaultDocument[] => {
    if (!isClient) return INITIAL_VAULT_DOCUMENTS;
    const stored = localStorage.getItem('jan_setu_documents');
    return stored ? JSON.parse(stored) : INITIAL_VAULT_DOCUMENTS;
  },
  addDocument: (doc: Omit<VaultDocument, 'id' | 'uploadedAt'>): VaultDocument => {
    const docs = documentStore.getDocuments();
    const newDoc: VaultDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    const updated = [newDoc, ...docs];
    if (isClient) {
      localStorage.setItem('jan_setu_documents', JSON.stringify(updated));
    }
    return newDoc;
  },
  deleteDocument: (id: string): void => {
    const docs = documentStore.getDocuments();
    const updated = docs.filter(d => d.id !== id);
    if (isClient) {
      localStorage.setItem('jan_setu_documents', JSON.stringify(updated));
    }
  }
};

export const reminderStore = {
  getReminders: (): DeadlineReminder[] => {
    if (!isClient) return INITIAL_REMINDERS;
    const stored = localStorage.getItem('jan_setu_reminders');
    return stored ? JSON.parse(stored) : INITIAL_REMINDERS;
  },
  addReminder: (reminder: Omit<DeadlineReminder, 'id' | 'createdAt' | 'status'>): DeadlineReminder => {
    const reminders = reminderStore.getReminders();
    const newReminder: DeadlineReminder = {
      ...reminder,
      id: `rem_${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const updated = [newReminder, ...reminders];
    if (isClient) {
      localStorage.setItem('jan_setu_reminders', JSON.stringify(updated));
    }
    return newReminder;
  },
  dismissReminder: (id: string): void => {
    const reminders = reminderStore.getReminders();
    const updated = reminders.map(r => r.id === id ? { ...r, status: 'dismissed' as const } : r);
    if (isClient) {
      localStorage.setItem('jan_setu_reminders', JSON.stringify(updated));
    }
  }
};
