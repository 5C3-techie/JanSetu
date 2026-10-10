import { CitizenProfile, VaultDocument, DeadlineReminder, Scheme } from './types';
import rawSchemes from '@/data/schemes.json';

export const EMPTY_CITIZEN_PROFILE: CitizenProfile = {
  id: '',
  name: '',
  age: 0,
  gender: 'all',
  state: '',
  district: '',
  isRural: false,
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
};

// Deprecated demo profile alias for type backward compatibility
export const DEMO_CITIZEN_PROFILE = EMPTY_CITIZEN_PROFILE;

export const INITIAL_VAULT_DOCUMENTS: VaultDocument[] = [];

export const INITIAL_REMINDERS: DeadlineReminder[] = [];

// Helper for client-side local storage fallback
const isClient = typeof window !== 'undefined';

export const profileStore = {
  getProfile: (): CitizenProfile => {
    if (!isClient) return EMPTY_CITIZEN_PROFILE;
    const stored = localStorage.getItem('jan_setu_profile');
    return stored ? JSON.parse(stored) : EMPTY_CITIZEN_PROFILE;
  },
  saveProfile: (profile: CitizenProfile): void => {
    if (isClient) {
      localStorage.setItem('jan_setu_profile', JSON.stringify(profile));
    }
  },
  resetProfileToEmpty: (): CitizenProfile => {
    if (isClient) {
      localStorage.setItem('jan_setu_profile', JSON.stringify(EMPTY_CITIZEN_PROFILE));
    }
    return EMPTY_CITIZEN_PROFILE;
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
    if (!isClient) return [];
    const stored = localStorage.getItem('jan_setu_documents');
    return stored ? JSON.parse(stored) : [];
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
    if (!isClient) return [];
    const stored = localStorage.getItem('jan_setu_reminders');
    return stored ? JSON.parse(stored) : [];
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

export const savedSchemeStore = {
  getSavedSchemes: (): string[] => {
    if (!isClient) return [];
    const stored = localStorage.getItem('jan_setu_saved_schemes');
    return stored ? JSON.parse(stored) : [];
  },
  toggleSavedScheme: (id: string): boolean => {
    const saved = savedSchemeStore.getSavedSchemes();
    const exists = saved.includes(id);
    const updated = exists ? saved.filter(s => s !== id) : [...saved, id];
    if (isClient) {
      localStorage.setItem('jan_setu_saved_schemes', JSON.stringify(updated));
    }
    return !exists;
  }
};


